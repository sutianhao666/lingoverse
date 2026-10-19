// 应用入口
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 全局错误捕获
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise:', e.reason);
  if (e.reason && e.reason.message) {
    App.toast(e.reason.message, 'error');
  }
});
