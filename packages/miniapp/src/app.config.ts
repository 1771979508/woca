export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/tasks/index',
    'pages/taskDetail/index',
    'pages/packages/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#6366f1',
    navigationBarTitleText: 'Woca',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#6366f1',
    backgroundColor: '#fff',
    list: [
      { pagePath: 'pages/home/index', text: '首页', iconPath: 'assets/icons/home.png', selectedIconPath: 'assets/icons/home-active.png' },
      { pagePath: 'pages/tasks/index', text: '任务', iconPath: 'assets/icons/task.png', selectedIconPath: 'assets/icons/task-active.png' },
      { pagePath: 'pages/packages/index', text: '套餐', iconPath: 'assets/icons/package.png', selectedIconPath: 'assets/icons/package-active.png' },
    ],
  },
})
