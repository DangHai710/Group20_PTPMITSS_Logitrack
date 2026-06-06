const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const backendDir = path.join(rootDir, 'logitrack-backend');
const frontendDir = path.join(rootDir, 'logitrack-frontend');
const desktopDir = path.join(__dirname, '..');
const binDir = path.join(desktopDir, 'bin');

function log(msg) {
  console.log(`\n=== [Build Script] ${msg} ===`);
}

try {
  // 1. Tạo thư mục bin nếu chưa có
  log('Tạo thư mục bin chứa file thực thi...');
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  // 2. Build Backend Spring Boot
  log('Đang compile Backend Spring Boot sang file JAR...');
  execSync('mvn clean package -DskipTests', { cwd: backendDir, stdio: 'inherit' });

  // 3. Sao chép file JAR vào thư mục bin của desktop
  log('Đang sao chép file JAR vào thư mục bin...');
  const jarName = 'logitrack-backend-0.0.1-SNAPSHOT.jar';
  const sourceJar = path.join(backendDir, 'target', jarName);
  const destJar = path.join(binDir, 'logitrack-backend.jar');

  if (fs.existsSync(sourceJar)) {
    fs.copyFileSync(sourceJar, destJar);
    console.log(`Đã copy file JAR thành công sang: ${destJar}`);
  } else {
    throw new Error(`Không tìm thấy file JAR nguồn tại: ${sourceJar}`);
  }

  // 4. Build Frontend Next.js
  log('Đang build tối ưu hóa Frontend Next.js...');
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

  log('Quy trình xây dựng (Build) thành công!');
  console.log('Bạn có thể chạy ứng dụng Desktop thử nghiệm bằng lệnh:');
  console.log('  npm start');
  console.log('Hoặc đóng gói thành file cài đặt .exe bằng lệnh:');
  console.log('  npm run dist');

} catch (err) {
  console.error('\n[LỖI] Quy trình build thất bại:', err.message);
  process.exit(1);
}
