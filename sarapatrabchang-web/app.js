/**
 * SarapatRabChang - Frontend Application Script
 * Controls interactive wireframe views, routing, and UI behaviors.
 */

// Current page state
let currentPage = 'page1';

// Page Title Mapping
const PAGE_TITLES = {
  page1: '1. สร้างบัญชี / เข้าสู่ระบบ - SarapatRabChang',
  page2: '2. ค้นหาช่างและผู้ช่วยมืออาชีพใกล้บ้านคุณ - SarapatRabChang',
  page3: '3. รายละเอียดบริการ (สุภาวดี ใจดี) - SarapatRabChang',
  page4: '4. ระบุรายละเอียดงานและสถานที่ - SarapatRabChang',
  page5: '5. ตรวจสอบและชำระเงิน - SarapatRabChang',
  page6: '6. ชำระเงินส่วนบุคคล (บัตรเครดิต) - SarapatRabChang',
  page7: '7. แชทพูดคุยส่วนตัว - SarapatRabChang',
  page8: '8. ติดตามงานและตรวจรับงาน - SarapatRabChang',
  page9: '9. ประเมินและให้คะแนน - SarapatRabChang',
  page10: '10. โปรไฟล์และข้อมูลส่วนตัว - SarapatRabChang'
};

// Verbal ratings mapping
const RATING_TEXTS = {
  1: { num: '1 / 5', text: 'ต้องปรับปรุง' },
  2: { num: '2 / 5', text: 'พอใช้' },
  3: { num: '3 / 5', text: 'ปานกลาง' },
  4: { num: '4 / 5', text: 'ดีมาก' },
  5: { num: '5 / 5', text: 'ดีเยี่ยม' }
};

/**
 * Initialize application on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
});

/**
 * Router Initialization & Hash Listener
 */
function initRouter() {
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    navigateTo(hash, false);
  } else {
    navigateTo('page1', false);
  }

  window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash && document.getElementById(currentHash) && currentHash !== currentPage) {
      navigateTo(currentHash, false);
    }
  });
}

/**
 * Navigate to a specific page view
 * @param {string} pageId e.g. 'page1', 'page2'
 * @param {boolean} updateHash whether to update browser hash
 */
function navigateTo(pageId, updateHash = true) {
  const targetElement = document.getElementById(pageId);
  if (!targetElement) return;

  // Hide all pages
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active-view');
  });

  // Show target page
  targetElement.classList.add('active-view');
  currentPage = pageId;

  // Update browser hash and page title
  if (updateHash) {
    window.location.hash = pageId;
  }
  document.title = PAGE_TITLES[pageId] || 'SarapatRabChang';


  // Adjust Header elements based on page context
  updateHeaderForPage(pageId);

  // Scroll to top of window
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // If opening chat page, scroll chat stream to bottom automatically
  if (pageId === 'page7') {
    setTimeout(() => {
      const stream = document.getElementById('chatStream');
      if (stream) {
        stream.scrollTop = stream.scrollHeight;
      }
    }, 100);
  }
}

/**
 * Update Header visibility rules matching wireframe specs
 */
function updateHeaderForPage(pageId) {
  const standardNav = document.getElementById('standardNav');
  const headerSearch = document.getElementById('headerSearchContainer');
  const authRight = document.getElementById('authHeaderRight');
  const userRight = document.getElementById('userHeaderRight');

  if (pageId === 'page1') {
    // Auth Page Header
    standardNav.style.display = 'none';
    headerSearch.style.display = 'none';
    authRight.style.display = 'block';
    userRight.style.display = 'none';
  } else if (pageId === 'page4' || pageId === 'page5' || pageId === 'page10') {
    // Search Bar Header (Pages 4, 5, 10)
    standardNav.style.display = 'none';
    headerSearch.style.display = 'flex';
    authRight.style.display = 'none';
    userRight.style.display = 'flex';
  } else {
    // Standard Logged-in Header (Pages 2, 3, 6, 7, 8, 9)
    standardNav.style.display = 'flex';
    headerSearch.style.display = 'none';
    authRight.style.display = 'none';
    userRight.style.display = 'flex';
  }
}


/**
 * Switch Auth Tab (Register / Login)
 */
function switchAuthTab(tab) {
  const tabReg = document.getElementById('tabRegisterBtn');
  const tabLogin = document.getElementById('tabLoginBtn');
  const regForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  if (tab === 'register') {
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
    regForm.classList.remove('hidden-view');
    loginForm.classList.add('hidden-view');
  } else {
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    loginForm.classList.remove('hidden-view');
    regForm.classList.add('hidden-view');
  }
}

/**
 * Handle Auth Submit (Register / Login)
 */
function handleAuthSubmit(event, type) {
  event.preventDefault();
  navigateTo('page2');
}

/**
 * Toggle Password Visibility
 */
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

/**
 * Character counter for textarea
 */
function updateCharCount(textarea) {
  const counter = document.getElementById('charCount');
  if (counter) {
    counter.textContent = `${textarea.value.length} / 500`;
  }
}

/**
 * Handle Photo Upload Mockup Preview
 */
function handlePhotoUpload(input) {
  const previewsRow = document.getElementById('photoPreviews');
  if (!previewsRow || !input.files) return;

  previewsRow.innerHTML = '';
  Array.from(input.files).slice(0, 5).forEach((file, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'uploaded-thumb';
    thumb.textContent = `รูป ${index + 1}`;
    previewsRow.appendChild(thumb);
  });
}

/**
 * Payment method selection in Page 5
 */
function selectPaymentMethod(method) {
  document.querySelectorAll('.payment-method-box').forEach(box => {
    box.classList.remove('selected');
  });

  const promptPay = document.getElementById('methodPromptPay');
  const creditCard = document.getElementById('methodCreditCard');
  const mobileBanking = document.getElementById('methodMobileBanking');

  if (method === 'promptpay' && promptPay) {
    promptPay.classList.add('selected');
    document.getElementById('radioPromptPay').checked = true;
  } else if (method === 'creditcard' && creditCard) {
    creditCard.classList.add('selected');
    document.getElementById('radioCreditCard').checked = true;
  } else if (method === 'mobilebanking' && mobileBanking) {
    mobileBanking.classList.add('selected');
    document.getElementById('radioMobileBanking').checked = true;
  }
}

/**
 * Toggle Tax Invoice Fields Visibility
 */
function toggleTaxForm(checkbox) {
  const fields = document.getElementById('taxInvoiceFields');
  if (fields) {
    fields.style.display = checkbox.checked ? 'block' : 'none';
  }
}

/**
 * Provider Auto-reply logic based on message context
 */
function getProviderAutoReply(userText) {
  const t = userText.toLowerCase();
  if (t.includes('ราคา') || t.includes('เท่าไหร่') || t.includes('กี่บาท') || t.includes('แพง') || t.includes('บาท')) {
    return 'ราคาแพ็กเกจคอนโดสะอาดสบายอยู่ที่ ฿650 ถ้วนค่ะ รวมค่าเดินทาง อุปกรณ์ และน้ำยาทำความสะอาดครบชุดแล้ว ไม่มีบวกเพิ่มแน่นอนค่ะ 😊';
  }
  if (t.includes('เวลา') || t.includes('กี่โมง') || t.includes('ว่าง') || t.includes('นัด') || t.includes('วันไหน')) {
    return 'สุภาวดีสามารถเริ่มงานได้ตรงตามเวลา 09:00–12:00 น. วันที่ 5 พ.ย. ตามที่ตกลงกันไว้เลยค่ะ พร้อมเข้าให้บริการตรงเวลาแน่นอนค่ะ';
  }
  if (t.includes('ครัว') || t.includes('ห้องน้ำ') || t.includes('ระเบียง') || t.includes('ห้อง') || t.includes('คราบ')) {
    return 'รับทราบเลยค่ะ สุภาวดีจะนำน้ำยาขจัดคราบฝังลึกมาดูแลบริเวณห้องครัวและห้องน้ำเป็นพิเศษให้สะอาดเอี่ยมทุกซอกทุกมุมเลยนะคะ ✨';
  }
  if (t.includes('อุปกรณ์') || t.includes('น้ำยา') || t.includes('เตรียม') || t.includes('เครื่องดูดฝุ่น')) {
    return 'ไม่ต้องเตรียมอุปกรณ์เลยค่ะ สุภาวดีนำเครื่องดูดฝุ่น ไม้ม็อบ ผ้าไมโครไฟเบอร์ และน้ำยาทำความสะอาดมาตรฐานมาให้ครบชุดค่ะ ทางคุณพิมพ์ชนกเตรียมแค่น้ำและไฟฟ้าไว้ก็เพียงพอค่ะ';
  }
  if (t.includes('ขอบคุณ') || t.includes('โอเค') || t.includes('ตกลง') || t.includes('ได้เลย') || t.includes('ครับ') || t.includes('ค่ะ') || t.includes('จอง')) {
    return 'ยินดีมากๆ ค่ะคุณพิมพ์ชนก สามารถกดปุ่ม "ดำเนินการชำระเงิน" ในกล่องสรุปข้อตกลงเพื่อยืนยันคิวงานได้เลยนะคะ สุภาวดีพร้อมดูแลเต็มที่ค่ะ 🙏';
  }
  if (t.includes('สวัสดี') || t.includes('ดีครับ') || t.includes('ดีค่ะ') || t.includes('ฮัลโหล')) {
    return 'สวัสดีค่ะคุณพิมพ์ชนก สุภาวดีพร้อมให้บริการค่ะ มีจุดไหนที่อยากสอบถามหรือต้องการให้เน้นเป็นพิเศษบอกได้เลยนะคะ';
  }
  return 'รับทราบข้อความเรียบร้อยค่ะคุณพิมพ์ชนก สุภาวดีบันทึกรายละเอียดไว้ให้แล้ว หากมีจุดไหนต้องการให้เน้นเป็นพิเศษสามารถแจ้งเพิ่มเติมได้ตลอดเลยนะคะ เดี๋ยวสุภาวดีจะดูแลให้อย่างดีที่สุดค่ะ 😊';
}

/**
 * Send Chat Message Simulator in Page 7 with Interactive Provider Auto-Reply
 */
function sendChatMessage(event) {
  event.preventDefault();
  const input = document.getElementById('chatInputMessage');
  const stream = document.getElementById('chatStream');
  if (!input || !stream || !input.value.trim()) return;

  const userText = input.value.trim();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

  // 1. Create outgoing bubble
  const bubbleRow = document.createElement('div');
  bubbleRow.className = 'chat-bubble-row outgoing';
  bubbleRow.innerHTML = `
    <div class="chat-bubble-content">
      <p>${escapeHtml(userText)}</p>
      <span class="bubble-meta">คุณ • ${timeStr} • ส่งแล้ว</span>
    </div>
  `;
  stream.appendChild(bubbleRow);
  input.value = '';

  // Update left sidebar preview
  const convPreview = document.querySelector('.conv-preview');
  const convTime = document.querySelector('.conv-time');
  if (convPreview) convPreview.textContent = userText;
  if (convTime) convTime.textContent = `วันนี้ ${timeStr}`;

  // Scroll to bottom
  stream.scrollTop = stream.scrollHeight;

  // 2. Show Typing Indicator
  const typingRow = document.createElement('div');
  typingRow.className = 'chat-bubble-row incoming typing-indicator';
  typingRow.id = 'chatTypingIndicator';
  typingRow.innerHTML = `
    <div class="chat-bubble-content typing-bubble">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-text">สุภาวดี กำลังพิมพ์...</span>
    </div>
  `;
  stream.appendChild(typingRow);
  stream.scrollTop = stream.scrollHeight;

  // 3. Provider Auto Reply after realistic delay (1s)
  setTimeout(() => {
    // Remove typing indicator
    const indicator = document.getElementById('chatTypingIndicator');
    if (indicator) indicator.remove();

    const replyText = getProviderAutoReply(userText);
    const replyNow = new Date();
    const replyTime = `${String(replyNow.getHours()).padStart(2, '0')}:${String(replyNow.getMinutes()).padStart(2, '0')} น.`;

    const replyBubble = document.createElement('div');
    replyBubble.className = 'chat-bubble-row incoming';
    replyBubble.innerHTML = `
      <div class="chat-bubble-content">
        <p>${escapeHtml(replyText)}</p>
        <span class="bubble-meta">สุภาวดี • ${replyTime}</span>
      </div>
    `;
    stream.appendChild(replyBubble);

    if (convPreview) convPreview.textContent = replyText;
    if (convTime) convTime.textContent = `วันนี้ ${replyTime}`;

    stream.scrollTop = stream.scrollHeight;
  }, 1000);
}

/**
 * Star Rating Interactive Control in Page 9
 */
function setRating(rating) {
  const stars = document.querySelectorAll('#starsPicker .star-interactive');
  stars.forEach(star => {
    const starVal = parseInt(star.getAttribute('data-rating'), 10);
    star.classList.toggle('active', starVal <= rating);
  });

  const scoreNum = document.getElementById('scoreNum');
  const scoreText = document.getElementById('scoreText');
  if (RATING_TEXTS[rating]) {
    scoreNum.textContent = RATING_TEXTS[rating].num;
    scoreText.textContent = RATING_TEXTS[rating].text;
  }
}

/**
 * Submit Review Action
 */
function submitReviewAction() {
  alert('ขอบคุณสำหรับรีวิว! ความคิดเห็นของคุณถูกบันทึกเรียบร้อยแล้ว');
  navigateTo('page10');
}

/**
 * Photo Lightbox Modal
 */
function openPhotoModal(title) {
  const overlay = document.getElementById('photoModalOverlay');
  const modalTitle = document.getElementById('photoModalTitle');
  const modalDesc = document.getElementById('photoModalDesc');

  if (overlay && modalTitle) {
    modalTitle.textContent = title;
    modalDesc.textContent = `ภาพผลงานจริงหลังทำความสะอาด: ${title}`;
    overlay.classList.add('open');
  }
}

function closePhotoModal() {
  const overlay = document.getElementById('photoModalOverlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
}

/**
 * Prompt to add interest tag in Profile
 */
function promptAddTag() {
  const newTag = prompt('ระบุประเภทงานที่ต้องการเพิ่ม (เช่น ซ่อมแอร์, ขนย้าย, ช่างประปา):');
  if (newTag && newTag.trim()) {
    const wrap = document.getElementById('interestTags');
    if (wrap) {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.innerHTML = `${escapeHtml(newTag.trim())} <button onclick="this.parentElement.remove()">×</button>`;
      wrap.appendChild(pill);
    }
  }
}

/**
 * Utility: HTML Escape
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

