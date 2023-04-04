class Result {
  static ofError(message) {
    return JSON.stringify({
      code: 'Error',
      success: false,
      message,
    });
  }

  static ofSuccess(data = '') {
    return JSON.stringify({
      code: 200,
      success: true,
      data: data,
    });
  }
}

module.exports = Result;

