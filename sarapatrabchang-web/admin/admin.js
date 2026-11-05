document.addEventListener('DOMContentLoaded', () => {
    // 1. ตั้งค่าเวลาอัปเดตล่าสุด
    const now = new Date();
    document.getElementById('last-update').textContent = now.toLocaleTimeString('th-TH');

    // 2. ฟังก์ชันจำลองการดึงข้อมูลจาก API (แก้ URL เป็นของจริงเมื่อต่อ Backend)
    async function fetchDashboardData() {
        try {
            // โค้ดสำหรับต่อ API จริงในอนาคต:
            // const response = await fetch('/api/admin/dashboard-summary');
            // const data = await response.json();
            
            // ข้อมูลจำลอง (Mock Data)
            const data = {
                stats: { kyc: 15, pendingJobs: 32, activeDisputes: 4, totalUsers: 1250 },
                activities: [
                    { time: '10:15 น.', user: 'Admin_01', action: 'อนุมัติประกาศงาน "ซ่อมแซมบันไดไม้" (ID: G123)', status: 'สำเร็จ', statusColor: 'text-green-500 bg-green-500/10' },
                    { time: '09:42 น.', user: 'System', action: 'มีผู้ใช้ใหม่สมัครสมาชิก "สมชาย ใจดี" (Freelancer)', status: 'ปกติ', statusColor: 'text-gray-300 bg-gray-700' },
                    { time: '08:30 น.', user: 'Admin_02', action: 'ระงับบัญชีผู้ใช้ "User99" เนื่องจากละเมิดกฎ', status: 'ดำเนินการแล้ว', statusColor: 'text-orange-500 bg-orange-500/10' }
                ]
            };

            updateDashboardUI(data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    }

    // 3. ฟังก์ชันอัปเดตหน้า UI หลังจากได้ข้อมูล
    function updateDashboardUI(data) {
        // อัปเดตตัวเลข Cards
        document.getElementById('stat-kyc').textContent = data.stats.kyc;
        document.getElementById('stat-jobs').textContent = data.stats.pendingJobs;
        document.getElementById('stat-disputes').textContent = data.stats.activeDisputes;
        document.getElementById('stat-users').textContent = data.stats.totalUsers.toLocaleString();

        // อัปเดตตารางกิจกรรม
        const tbody = document.getElementById('activity-table-body');
        tbody.innerHTML = ''; // ล้างข้อความ "กำลังโหลดข้อมูล..."

        data.activities.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-800 hover:bg-[#1f1f1f] transition';
            tr.innerHTML = `
                <td class="p-4 text-gray-400">${item.time}</td>
                <td class="p-4 font-medium text-white">${item.user}</td>
                <td class="p-4 text-gray-300">${item.action}</td>
                <td class="p-4">
                    <span class="px-2.5 py-1 text-xs rounded-md ${item.statusColor}">${item.status}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. ตั้งค่า Chart.js สำหรับกราฟสถิติ
    function initChart() {
        const ctx = document.getElementById('platformChart').getContext('2d');
        
        // สร้าง Gradient แนวตั้ง สีส้มไล่ไปโปร่งใส
        let gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
        gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['01', '05', '10', '15', '20', '25', '30'],
                datasets: [{
                    label: 'จำนวนการจ้างงานสำเร็จ',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#f97316',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#0a0a0a',
                    pointBorderColor: '#f97316',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4 // ปรับให้เส้นโค้งสมูท
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#171717',
                        titleColor: '#fff',
                        bodyColor: '#e5e5e5',
                        borderColor: '#333',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#262626', drawBorder: false },
                        ticks: { color: '#737373' }
                    },
                    y: {
                        grid: { color: '#262626', drawBorder: false },
                        ticks: { color: '#737373' },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // รันการทำงานเมื่อโหลดไฟล์ JS
    fetchDashboardData();
    initChart();
});