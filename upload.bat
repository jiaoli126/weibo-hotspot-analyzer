@echo off
echo ========================================
echo 微博热搜项目 - Git 上传脚本
echo ========================================
echo.

cd C:\Users\79302\Documents\weibo-hotspot-github

echo [1/6] 初始化 Git 仓库...
git init

echo.
echo [2/6] 添加所有文件...
git add .

echo.
echo [3/6] 提交到本地仓库...
git commit -m "🎉 初始化项目（GitHub Models 免费版）"

echo.
echo [4/6] 关联远程仓库...
git remote add origin https://github.com/jiaoli126/weibo-hotspot-analyzer.git

echo.
echo [5/6] 设置主分支...
git branch -M main

echo.
echo [6/6] 推送到 GitHub...
git push -u origin main

echo.
echo ========================================
echo ✅ 上传完成！
echo ========================================
echo.
echo 请访问查看：https://github.com/jiaoli126/weibo-hotspot-analyzer
echo.
pause
