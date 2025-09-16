# 🖥️ Platform-Specific Setup Guide

## 🪟 **Windows Setup**

### **Option 1: Native Windows**

#### **Install Node.js**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download LTS version (20.x recommended)
3. Run installer as administrator
4. Restart command prompt

#### **Verify Installation**
```cmd
node --version
npm --version
```

#### **Install Project**
```cmd
# Extract project
tar -xzf roach-rally-project.tar.gz
cd roach-rally-clean

# Install dependencies
npm install

# Start development
npm run dev
```

### **Option 2: WSL2 (Recommended)**

#### **Enable WSL2**
```powershell
# Run PowerShell as administrator
wsl --install
# Restart computer when prompted
```

#### **Install Ubuntu**
```bash
# Open Ubuntu terminal
sudo apt update
sudo apt install nodejs npm

# Install project
tar -xzf roach-rally-project.tar.gz
cd roach-rally-clean
npm install
npm run dev
```

#### **Install VS Code with WSL**
1. Install VS Code
2. Install "WSL" extension
3. Open project in WSL: `code .`

---

## 🍎 **macOS Setup**

### **Install Homebrew**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### **Install Node.js**
```bash
brew install node
```

### **Install Project**
```bash
# Extract project
tar -xzf roach-rally-project.tar.gz
cd roach-rally-clean

# Install dependencies
npm install

# Start development
npm run dev
```

### **Install VS Code**
```bash
brew install --cask visual-studio-code
```

---

## 🐧 **Linux Setup**

### **Ubuntu/Debian**
```bash
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Install VS Code (optional)
sudo snap install code --classic

# Install project
tar -xzf roach-rally-project.tar.gz
cd roach-rally-clean
npm install
npm run dev
```

### **CentOS/RHEL**
```bash
# Install Node.js and npm
sudo yum install nodejs npm
# Or on newer versions:
sudo dnf install nodejs npm

# Install project
tar -xzf roach-rally-project.tar.gz
cd roach-rally-clean
npm install
npm run dev
```

### **Arch Linux**
```bash
# Install Node.js and npm
sudo pacman -S nodejs npm

# Install project
tar -xzf roach-rally-project.tar.gz
cd roach-rally-clean
npm install
npm run dev
```

---

## 🔧 **Platform-Specific Issues**

### **Windows Issues**

#### **"npm not recognized"**
- Restart command prompt after Node.js installation
- Check PATH environment variable

#### **Permission errors**
- Run command prompt as administrator
- Use WSL2 for better compatibility

#### **Path length issues**
- Enable long path support in Windows
- Use shorter directory names

### **macOS Issues**

#### **"command not found: node"**
- Add Homebrew to PATH:
  ```bash
  echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc
  ```

#### **Permission denied**
- Use `sudo` for system-wide installations
- Or install with Homebrew (recommended)

### **Linux Issues**

#### **Package not found**
- Update package list: `sudo apt update`
- Install build tools: `sudo apt install build-essential`

#### **Permission errors**
- Use `sudo` for system installations
- Or install with Node Version Manager (nvm)

---

## 🛠️ **Development Tools**

### **VS Code Extensions**
Install these extensions for better development:

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **Prisma**
- **Solana**

### **Browser Extensions**
- **Phantom Wallet** (Chrome/Firefox)
- **Solflare Wallet** (Chrome/Firefox)
- **Backpack Wallet** (Chrome/Firefox)

---

## 🚀 **Performance Tips**

### **Windows**
- Use WSL2 for better performance
- Close unnecessary applications
- Use SSD storage if possible

### **macOS**
- Use Homebrew for package management
- Close unnecessary applications
- Use Activity Monitor to check resource usage

### **Linux**
- Use package manager for dependencies
- Monitor system resources with `htop`
- Use SSD storage for better performance

---

## 📱 **Mobile Development**

### **iOS Simulator**
```bash
# Install Xcode from App Store
# Install iOS Simulator
# Test responsive design
```

### **Android Emulator**
```bash
# Install Android Studio
# Create virtual device
# Test responsive design
```

---

## 🔒 **Security Considerations**

### **All Platforms**
- Keep Node.js updated
- Use strong environment variables
- Don't commit sensitive data
- Use HTTPS in production

### **Windows**
- Use Windows Defender
- Keep system updated
- Use WSL2 for better security

### **macOS**
- Use Gatekeeper
- Keep system updated
- Use Homebrew for package management

### **Linux**
- Use package manager
- Keep system updated
- Use firewall (ufw/iptables)

---

## 📊 **System Requirements**

### **Minimum Requirements**
- **RAM**: 4GB
- **Storage**: 2GB free space
- **CPU**: Dual-core processor
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

### **Recommended Requirements**
- **RAM**: 8GB+
- **Storage**: 10GB+ free space
- **CPU**: Quad-core processor
- **OS**: Latest versions

---

## 🎯 **Platform-Specific Commands**

### **Windows (CMD)**
```cmd
# Check Node.js version
node --version

# Install dependencies
npm install

# Start development
npm run dev
```

### **Windows (PowerShell)**
```powershell
# Check Node.js version
node --version

# Install dependencies
npm install

# Start development
npm run dev
```

### **macOS/Linux**
```bash
# Check Node.js version
node --version

# Install dependencies
npm install

# Start development
npm run dev
```

---

## 🆘 **Getting Help**

### **Platform-Specific Support**
- **Windows**: Microsoft documentation
- **macOS**: Apple developer documentation
- **Linux**: Distribution-specific documentation

### **Node.js Issues**
- Check Node.js version compatibility
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### **Project Issues**
- Check browser console (F12)
- Check server logs in terminal
- Verify environment variables

---

**Choose your platform and get started! 🚀**
