const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess = null;
let frontendProcess = null;

// Cấu hình cổng kết nối
const BACKEND_PORT = 8080;
const FRONTEND_PORT = 3000;

const fs = require('fs');

// Hàm tự động tìm và trả về đường dẫn java executable phù hợp (>= 17)
function getJavaPath() {
  if (process.platform === 'win32') {
    const javaDir = 'C:\\Program Files\\Java';
    try {
      if (fs.existsSync(javaDir)) {
        const dirs = fs.readdirSync(javaDir);
        // Sắp xếp ngược để lấy bản JDK cao nhất trước (ví dụ: jdk-22 trước jdk-17)
        const jdkDirs = dirs
          .filter(dir => dir.startsWith('jdk-'))
          .sort((a, b) => b.localeCompare(a));
        
        for (const dir of jdkDirs) {
          const javaExe = path.join(javaDir, dir, 'bin', 'java.exe');
          if (fs.existsSync(javaExe)) {
            console.log(`[Desktop] Tìm thấy JDK phù hợp tại: ${javaExe}`);
            return javaExe;
          }
        }
      }
    } catch (err) {
      console.error('[Desktop] Lỗi khi quét thư mục Java:', err);
    }
  }
  return 'java';
}

// Hàm kiểm tra xem Java đã được cài đặt chưa
function checkJavaInstalled() {
  const javaPath = getJavaPath();
  try {
    execSync(`"${javaPath}" -version`, { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

// Hàm kiểm tra xem cổng kết nối đã mở chưa
function checkPortOpen(port, callback) {
  const server = http.createServer();
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      callback(true); // Cổng đã bị chiếm (đang mở/đang chạy)
    } else {
      callback(false);
    }
  });
  server.once('listening', () => {
    server.close();
    callback(false); // Cổng đang trống
  });
  server.listen(port);
}

// Khởi chạy ngầm Backend (Spring Boot JAR)
function startBackend() {
  return new Promise((resolve, reject) => {
    // Kiểm tra xem cổng 8080 có đang chạy sẵn không (tránh chạy đè)
    checkPortOpen(BACKEND_PORT, (isOpen) => {
      if (isOpen) {
        console.log(`[Desktop] Cổng ${BACKEND_PORT} đã mở sẵn, kết nối trực tiếp với Backend hiện tại.`);
        return resolve();
      }

      console.log('[Desktop] Đang khởi chạy Backend Spring Boot JAR...');
      const jarPath = path.join(__dirname, 'bin', 'logitrack-backend.jar');
      const javaPath = getJavaPath();
      
      // Chạy lệnh: javaPath -jar bin/logitrack-backend.jar
      backendProcess = spawn(javaPath, ['-jar', jarPath], {
        cwd: __dirname,
        env: { ...process.env, SPRING_PROFILES_ACTIVE: 'prod' }
      });

      // Lắng nghe logs của Backend để phát hiện khi khởi động xong
      backendProcess.stdout.on('data', (data) => {
        const logStr = data.toString();
        console.log(`[Spring Boot] ${logStr.trim()}`);
        
        // Kiểm tra dòng chữ đánh dấu Spring Boot chạy thành công
        if (logStr.includes('Started LogitrackBackendApplication')) {
          console.log('[Desktop] Backend Spring Boot đã sẵn sàng!');
          resolve();
        }
      });

      backendProcess.stderr.on('data', (data) => {
        console.error(`[Spring Boot Error] ${data.toString()}`);
      });

      backendProcess.on('error', (err) => {
        console.error('[Desktop] Lỗi khi chạy file JAR:', err);
        reject(err);
      });

      backendProcess.on('close', (code) => {
        console.log(`[Desktop] Tiến trình Backend dừng với mã lỗi: ${code}`);
      });
    });
  });
}

// Khởi chạy ngầm Frontend (Next.js server)
function startFrontend() {
  return new Promise((resolve, reject) => {
    checkPortOpen(FRONTEND_PORT, (isOpen) => {
      if (isOpen) {
        console.log(`[Desktop] Cổng ${FRONTEND_PORT} đã mở sẵn, kết nối trực tiếp.`);
        return resolve();
      }

      console.log('[Desktop] Đang khởi chạy Frontend Next.js...');
      
      // Đường dẫn tới thư mục logitrack-frontend
      // Trong môi trường dev: ../logitrack-frontend
      // Trong môi trường packaged: thư mục con tương ứng
      const frontendDir = app.isPackaged 
        ? path.join(__dirname, 'frontend')
        : path.join(__dirname, '..', 'logitrack-frontend');

      // Chạy lệnh: npx next start (hoặc npm run start)
      // Dùng shell: true để giải quyết vấn đề thực thi lệnh npm/npx trên Windows
      frontendProcess = spawn('npx', ['next', 'start', '-p', FRONTEND_PORT.toString()], {
        cwd: frontendDir,
        shell: true
      });

      frontendProcess.stdout.on('data', (data) => {
        const logStr = data.toString();
        console.log(`[Next.js] ${logStr.trim()}`);
        if (logStr.includes('Ready in') || logStr.includes('Listening on') || logStr.includes('start')) {
          console.log('[Desktop] Frontend Next.js đã sẵn sàng!');
          resolve();
        }
      });

      frontendProcess.stderr.on('data', (data) => {
        console.error(`[Next.js Error] ${data.toString()}`);
      });

      frontendProcess.on('error', (err) => {
        console.error('[Desktop] Lỗi khi chạy Next.js:', err);
        reject(err);
      });

      // Để an toàn, nếu sau 6 giây không bắt được dòng chữ, vẫn tiếp tục load
      setTimeout(() => {
        resolve();
      }, 6000);
    });
  });
}

// Tạo cửa sổ ứng dụng
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    title: "LogiTrack B2B - Hệ thống Đặt hàng Nhập khẩu Tối ưu",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenuBarVisibility(false);

  // Load URL trang chủ Next.js
  mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Khởi tạo ứng dụng
app.whenReady().then(async () => {
  // 1. Kiểm tra môi trường Java
  if (!checkJavaInstalled()) {
    dialog.showErrorBox(
      'Thiếu môi trường Java',
      'Máy tính của bạn chưa cài đặt Java (JRE/JDK 17 trở lên). Vui lòng cài đặt Java để chạy ứng dụng LogiTrack B2B.'
    );
    app.quit();
    return;
  }

  try {
    // 2. Khởi chạy ngầm các tiến trình backend và frontend
    await startBackend();
    await startFrontend();
    
    // 3. Hiển thị giao diện người dùng
    createWindow();
  } catch (err) {
    dialog.showErrorBox('Lỗi khởi động', `Đã xảy ra lỗi khi khởi chạy ứng dụng: ${err.message}`);
    app.quit();
  }
});

// Xử lý đóng app và dọn dẹp các tiến trình ngầm
app.on('window-all-closed', () => {
  console.log('[Desktop] Cửa sổ đóng, đang giải phóng các tiến trình ngầm...');
  
  if (backendProcess) {
    // Trên Windows, dùng taskkill để kill triệt để cả tiến trình con của Java
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t']);
    } else {
      backendProcess.kill();
    }
  }

  if (frontendProcess) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', frontendProcess.pid, '/f', '/t']);
    } else {
      frontendProcess.kill();
    }
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
