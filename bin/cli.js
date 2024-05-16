#!/usr/bin/env node
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const archiver = require("archiver");
const spinners = require("cli-spinners");

const args = require("minimist")(process.argv.slice(2), {
  default: {
    dir: process.cwd(),
  },
});

if (args.help) {
  console.log("Usage:");
  console.log(
    "  startdist    " + chalk.hex("#049CDB").bold("需要压缩并打开的文件名")
  );
  console.log("  startdist    " + chalk.hex("#049CDB").bold("E://xxxxxx"));
  return
}

const p = args._[0] || "";
const dir = path.resolve(args.dir, p);

try {
  // 判断目录是否存在
  fs.accessSync(dir);
  const loadingInterval = showLoading();
  compressFile(args.dir, dir, p).then(() => {
    clearInterval(loadingInterval);
    const command = `start explorer.exe /select,${dir}`;
    // 执行命令
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`执行的错误: ${error}`);
        return;
      }
    });
  });
} catch (err) {
  console.log(chalk.hex("#e43961").bold(`${dir} does not exist.`));
}

function compressFile(outputDir, targetDir, fileName) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir); // 如果文件夹不存在，则创建
    
    let output = fs.createWriteStream(`${outputDir}/${fileName}.zip`); // 创建⽂件写⼊流
    const archive = archiver("zip", { zlib: { level: 9 } }); // 设置压缩等级
    output
      .on("close", () => {
        console.log("startdist：" + chalk.hex("#049CDB").bold("压缩成功"));
        console.log("startdist：" + chalk.hex("#049CDB").bold(`${outputDir}\\${fileName}.zip`));
        resolve(true);
      })
      .on("error", (err) => {
        console.log(chalk.hex("#049CDB").bold("压缩错误"));
        reject(false);
      });

    archive.pipe(output);
    archive.directory(targetDir, false); // 存储⽬标⽂件
    archive.finalize(); // 完成归档
  });
}

// 显示loading状态
function showLoading() {
  let i = 0;
  const spinner = spinners.dots12; // 选择一个loading效果，这里使用dots12

  const interval = setInterval(() => {
    const { frames } = spinner;
    const frame = frames[(i = ++i % frames.length)];
    process.stdout.write(frame + " Loading..."); // 在控制台输出loading效果和提示文本
    process.stdout.clearLine(1); // 清除当前行
    process.stdout.cursorTo(0); // 将光标移动到行首
  }, spinner.interval);

  return interval;
}
