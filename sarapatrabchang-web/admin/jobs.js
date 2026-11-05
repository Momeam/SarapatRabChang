document.addEventListener('DOMContentLoaded', () => {
    
    // 1. จำลองฐานข้อมูลงาน (มีสถานะเริ่มต้นเป็น PENDING)
    let jobsDatabase = [
        { id: 'J001', title: 'รับเขียนเว็บ E-commerce ด้วย React', freelancer: 'สมหญิง รักงาน', price: '฿ 15,000', status: 'PENDING' },
        { id: 'J002', title: 'รับวาดภาพประกอบสไตล์อนิเมะ', freelancer: 'สาววาด สตูดิโอ', price: '฿ 500', status: 'PENDING' },
        { id: 'J003', title: 'แอดมินดูแลเพจ ตอบแชทลูกค้า (สแปมคำหยาบ)', freelancer: 'เกรียน คีย์บอร์ด', price: '฿ 100', status: 'PENDING' },
        { id: 'J004', title: 'ออกแบบโลโก้บริษัท', freelancer: 'ดีไซน์ สุดเจ๋ง', price: '฿ 3,000', status: 'APPROVED' } // ตัวอย่างที่อนุมัติแล้ว
    ];

    const tbody = document.getElementById('jobs-table-body');
    const statusFilter = document.getElementById('status-filter');
    const alertBox = document.getElementById('alert-message');

    // 2. ฟังก์ชันวาดตาราง (กรองตามสถานะที่เลือก)
    function renderTable() {
        const currentFilter = statusFilter.value;
        const filteredJobs = jobsDatabase.filter(job => job.status === currentFilter);
        
        tbody.innerHTML = ''; // ล้างตาราง

        if (filteredJobs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">ไม่มีประกาศบริการในสถานะนี้</td></tr>`;
            return;
        }

        filteredJobs.forEach(job => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-800 hover:bg-[#1f1f1f] transition';
            
            // สร้างปุ่มตามสถานะ (ถ้ารอตรวจสอบ ถึงจะแสดงปุ่มอนุมัติ/ปฏิเสธ)
            let actionButtons = `<button class="px-3 py-1.5 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition"><i class="fa-regular fa-eye mr-1"></i> ดูตัวอย่าง</button>`;
            
            if (job.status === 'PENDING') {
                actionButtons += `
                    <button onclick="approveJob('${job.id}')" class="px-3 py-1.5 text-xs border border-green-600 text-green-500 rounded hover:bg-green-500/10 transition ml-2">
                        <i class="fa-solid fa-check mr-1"></i> อนุมัติ
                    </button>
                    <button onclick="rejectJob('${job.id}')" class="px-3 py-1.5 text-xs border border-red-600 text-red-500 rounded hover:bg-red-500/10 transition ml-2">
                        <i class="fa-solid fa-xmark mr-1"></i> ปฏิเสธ
                    </button>
                `;
            }

            tr.innerHTML = `
                <td class="p-4">
                    <div class="w-12 h-10 bg-gray-800 rounded border border-gray-700 flex flex-col items-center justify-center text-gray-500">
                        <i class="fa-regular fa-image text-sm"></i>
                        <span class="text-[8px] mt-0.5">IMG</span>
                    </div>
                </td>
                <td class="p-4 font-medium text-white">${job.title}</td>
                <td class="p-4 text-gray-400">${job.freelancer}</td>
                <td class="p-4 text-gray-300">${job.price}</td>
                <td class="p-4 text-right">${actionButtons}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 3. ฟังก์ชันแสดงข้อความแจ้งเตือน (Alert)
    function showAlert(message, type) {
        alertBox.textContent = message;
        alertBox.className = `mb-4 px-4 py-3 rounded border text-sm font-medium block`;
        
        if (type === 'success') {
            alertBox.classList.add('bg-green-500/10', 'border-green-500', 'text-green-500');
        } else if (type === 'danger') {
            alertBox.classList.add('bg-red-500/10', 'border-red-500', 'text-red-500');
        }

        // ซ่อนข้อความอัตโนมัติหลัง 3 วินาที
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 3000);
    }

    // 4. ฟังก์ชันจัดการเมื่อกดปุ่ม "อนุมัติ" (เชื่อมต่อ Global Window เพื่อให้ onclick ใน HTML เรียกใช้ได้)
    window.approveJob = async (id) => {
        if (confirm('ยืนยันการอนุมัติประกาศนี้ใช่หรือไม่?')) {
            try {
                // ==========================================
                // โค้ดสำหรับ Backend ของจริง (เปิดคอมเมนต์เมื่อพร้อมใช้งาน):
                // const response = await fetch(`/api/admin/jobs/${id}/approve`, { method: 'POST' });
                // if (!response.ok) throw new Error('Failed');
                // ==========================================

                // อัปเดตข้อมูลจำลองในหน้าเว็บ
                const jobIndex = jobsDatabase.findIndex(j => j.id === id);
                jobsDatabase[jobIndex].status = 'APPROVED';
                
                showAlert(`อนุมัติประกาศ "${jobsDatabase[jobIndex].title}" สำเร็จ!`, 'success');
                renderTable(); // วาดตารางใหม่ (รายการนี้จะหายไปจากหน้า PENDING)
            } catch (error) {
                showAlert('เกิดข้อผิดพลาดในการอนุมัติ', 'danger');
            }
        }
    };

    // 5. ฟังก์ชันจัดการเมื่อกดปุ่ม "ปฏิเสธ"
    window.rejectJob = async (id) => {
        // ให้แอดมินพิมพ์เหตุผลที่ปฏิเสธตามข้อกำหนด
        const reason = prompt('ระบุเหตุผลในการปฏิเสธประกาศนี้ (เช่น รูปภาพไม่เหมาะสม):');
        
        if (reason !== null && reason.trim() !== '') {
            try {

                const jobIndex = jobsDatabase.findIndex(j => j.id === id);
                jobsDatabase[jobIndex].status = 'REJECTED';
                
                showAlert(`ปฏิเสธประกาศ "${jobsDatabase[jobIndex].title}" เรียบร้อยแล้ว (เหตุผล: ${reason})`, 'danger');
                renderTable();
            } catch (error) {
                showAlert('เกิดข้อผิดพลาดในการปฏิเสธ', 'danger');
            }
        } else if (reason !== null) {
            alert('กรุณาระบุเหตุผลในการปฏิเสธ');
        }
    };

    // เมื่อเปลี่ยนตัวกรองสถานะ ให้วาดตารางใหม่
    statusFilter.addEventListener('change', renderTable);

    // วาดตารางครั้งแรกเมื่อเปิดหน้าเว็บ
    renderTable();
});