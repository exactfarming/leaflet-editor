module.exports = {
  'test_page': 'test/index.html',
  'framework': 'mocha',
  'src_files': [
    'dist/**/*.min.js'
  ],
  'launch_in_ci': [
    'Chrome',
  ],
  'launch_in_dev': [
    'Chrome',
  ],
  'browser_args': {
    'Chrome': [
      '--disable-gpu',
      '--disable-web-security',
      '--headless',
      '--incognito',
      '--no-sandbox',
      '--remote-debugging-address=0.0.0.0',
      '--remote-debugging-port=9222',
    ],
  }
};
