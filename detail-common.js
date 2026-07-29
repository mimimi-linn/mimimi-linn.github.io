/* ============================================
   detail-common.js - H5二级详情页共享脚本
   打卡状态管理 | Toast提示
   ============================================ */

/**
 * 初始化打卡状态
 * @param {number} moduleId - 模块ID
 */
function initCheckinState(moduleId) {
  var key = 'checkin_' + moduleId;
  var btn = document.getElementById('checkinBtn');
  if (!btn) return;

  var isChecked = localStorage.getItem(key) === 'true';
  if (isChecked) {
    btn.classList.add('checked');
    btn.textContent = '已打卡';
  }
}

/**
 * 切换打卡状态
 * @param {number} moduleId - 模块ID
 */
function toggleCheckin(moduleId) {
  var key = 'checkin_' + moduleId;
  var btn = document.getElementById('checkinBtn');
  if (!btn) return;

  var isChecked = localStorage.getItem(key) === 'true';

  if (isChecked) {
    localStorage.setItem(key, 'false');
    btn.classList.remove('checked');
    btn.textContent = '打卡提交';
    showToast('已取消打卡');
  } else {
    localStorage.setItem(key, 'true');
    btn.classList.add('checked');
    btn.textContent = '已打卡';
    showToast('打卡成功');
  }
}

/**
 * 显示Toast提示
 * @param {string} msg - 提示文字
 * @param {number} duration - 显示时长(ms)，默认2000
 */
function showToast(msg, duration) {
  duration = duration || 2000;

  // 移除已有的toast
  var existing = document.querySelector('.toast');
  if (existing) {
    existing.parentNode.removeChild(existing);
  }

  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  // 触发动画
  requestAnimationFrame(function () {
    toast.classList.add('show');
  });

  // 自动消失
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 350);
  }, duration);
}
