// Adapted from Shdr Validator class https://github.com/BKcore/Shdr
// Creates and validates a shader from a text source based on type
// (src, type) -> false || [ok, line, error]
// src: glsl text to be validated
// type: 0 for vertex shader, 1 for fragment shader, else return false
// ok: boolean for whether the shader is ok or not
// line: which line number throws error (only if ok is false)
// error: description of error (only if ok is false and line != null)
export const validate = (context: any, src: any, type: any) => {
  // uniforms don't get validated by glsl
  if (type !== 0 && type !== 1) {
    return false;
  }
  if (!src) {
    return [false, 0, 'Shader cannot be empty'];
  }
  if (!context) {
    console.warn('No WebGL context.');
  }
  var details, error, i, line, lines, log, message, shader, status, _i, _len;
  try {
    var shaderType =
      type === 0 ? context.VERTEX_SHADER : context.FRAGMENT_SHADER;
    shader = context.createShader(shaderType);
    context.shaderSource(shader, src);
    context.compileShader(shader);
    status = context.getShaderParameter(shader, context.COMPILE_STATUS);
  } catch (e) {
    return [false, 0, e.getMessage];
  }
  if (status === true) {
    return [true, null, null];
  } else {
    // filters out THREE.js handled errors in the raw log

    log = context.getShaderInfoLog(shader);
    var rawLog = log;
    lines = rawLog.split('\n');
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      i = lines[_i];
      if (i.substr(0, 5) === 'ERROR') {
        if (i.indexOf('undeclared identifier') > -1) {
          if (
            i.indexOf('projectionMatrix') > -1 ||
            i.indexOf('modelMatrix') > -1 ||
            i.indexOf('modelViewMatrix') > -1 ||
            i.indexOf('viewMatrix') > -1 ||
            i.indexOf('cameraPosition') > -1 ||
            i.indexOf('normal') > -1 ||
            i.indexOf('uv') > -1 ||
            i.indexOf('uv2') > -1 ||
            i.indexOf('position') > -1
          ) {
            lines.splice(_i, 1);
            _i--;
            _len--;
          }
        } else if (i.indexOf('No precision specified for (float)') > -1) {
          lines.splice(_i, 1);
          _i--;
          _len--;
        } else if (
          i.indexOf(
            "'constructor' : not enough data provided for construction"
          ) > -1
        ) {
          lines.splice(_i, 1);
          _i--;
          _len--;
        }
      }
    }
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      i = lines[_i];
      if (i.substr(0, 5) === 'ERROR') {
        error = i;
      }
    }
    if (!error || error[0] === '') {
      return [true, null, null];
      // return [false, 0, 'Unable to parse error.'];
    }
    details = error.split(':');
    if (details.length < 4) {
      return [false, 0, error];
    }
    line = details[2];
    message = details.splice(3).join(':');
    return [false, parseInt(line), message];
  }
};
