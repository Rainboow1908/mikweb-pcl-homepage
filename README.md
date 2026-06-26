# MikWeb PCL 主页

Mik Casual Minecraft 服务器的 PCL 启动器自定义主页。

启动后自动从 MikWeb API 拉取实时数据：在线玩家、公告、封禁列表、建筑数量、历史在线统计。

---

## 环境要求

- **Windows** 操作系统
- **Node.js** LTS 版本

### 安装 Node.js

1. 打开 https://nodejs.org
2. 下载 **LTS** 版本（左侧绿色按钮）
3. 运行安装程序，全部默认，一路 Next
4. 打开 CMD 输入 `node -v`，显示版本号即成功

---

## 快速开始

1. 双击 `start.bat`（服务器在最小化窗口运行）
2. 打开 PCL，进入 **设置 → 个性化 → 主页**
3. **联网更新的下载地址** 填入：

```
http://localhost:38080/pcl-homepage.xaml
```

4. 点击 PCL 主页的刷新按钮，即可看到实时数据

---

## 脚本说明

| 文件 | 功能 | 用法 |
|------|------|------|
| `start.bat` | 启动服务器 | 双击，最小化运行 |
| `stop.bat` | 停止服务器 | 双击 |
| `install-startup.bat` | 设为开机自启 | 右键 → 以管理员身份运行 |
| `uninstall-startup.bat` | 取消开机自启 | 双击 |

---

## 环境变量（可选）

修改默认配置，在 CMD 中设置后启动：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `38080` | HTTP 监听端口 |
| `API_BASE` | `https://mcmik.top/api` | MikWeb API 地址 |
| `SERVER_ADDR` | `noctiro.moe` | 显示的 MC 连接地址 |

示例：

```powershell
$env:PORT = "12345"
$env:SERVER_ADDR = "play.example.com"
node server.js
```

---

## 项目结构

```
├── server.js              # 主程序（HTTP 服务 + XAML 生成）
├── package.json
├── start.bat              # 启动
├── stop.bat               # 停止
├── install-startup.bat    # 开机自启
├── uninstall-startup.bat  # 取消自启
└── README.md
```

---

## 参考

- [MikWeb API 仓库](https://github.com/Encinet/MikWeb)
- [PCL Wiki - 替换标记](https://github.com/Meloong-Git/PCL/wiki/%E6%9B%BF%E6%8D%A2%E6%A0%87%E8%AE%B0)
- [PCL Wiki - 自定义事件](https://github.com/Meloong-Git/PCL/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6)
