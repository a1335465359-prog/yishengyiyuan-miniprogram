const api = require('./api/index');

App({
  globalData: {
    userInfo: null,
    api,
    cloudReady: false
  },

  onLaunch() {
    console.log('一绳一愿小程序启动');
    
    // 初始化云开发
    if (!wx.cloud) {
      console.warn('微信版本过低，不支持云开发');
    } else {
      wx.cloud.init({
        env: 'yishengyiyuan-prod', // 后续替换为你的真实云环境 ID
        traceUser: true
      });
      this.globalData.cloudReady = true;
      console.log('云开发初始化完成');
    }

    // 检查更新
    this.checkUpdate();
  },

  checkUpdate() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) updateManager.applyUpdate();
            }
          });
        });
      }
    });
  },

  async login() {
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('微信登录 code:', res.code);
          // 后续可发送 code 到云函数换取 openid
        }
      }
    });
  }
});
