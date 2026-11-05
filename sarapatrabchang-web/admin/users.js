document.addEventListener('DOMContentLoaded', () => {
    
    // ข้อมูลผู้ใช้จำลอง (Mock Data) อิงตาม Wireframe
    const usersData = [
        { 
            id: 'U-101', 
            name: 'สมหญิง รักงาน', 
            email: 'somying@email.com', 
            type: 'Freelancer',
            actions: ['view', 'suspend', 'kyc']
        },
        { 
            id: 'U-102', 
            name: 'มานะ อดทน', 
            email: 'mana@email.com', 
            type: 'Client',
            actions: ['view', 'suspend']
        },
        { 
            id: 'U-103', 
            name: 'เอกชัย สบาย', 
            email: 'eka@email.com', 
            type: 'Freelancer',
            actions: ['view', 'unlock']
        }
    ];

    // ฟังก์ชันสร้างปุ่ม Action ตามข้อมูล
    function generateActionButtons(actions) {
        let buttonsHTML = '';
        
        actions.forEach(action => {
            if (action === 'view') {
                buttonsHTML += `<button class="px-3 py-1 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition mr-2"><i class="fa-regular fa-eye mr-1"></i> ดูข้อมูล</button>`;
            } else if (action === 'suspend') {
                buttonsHTML += `<button class="px-3 py-1 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition mr-2"><i class="fa-solid fa-ban mr-1"></i> ระงับบัญชี</button>`;
            } else if (action === 'unlock') {
                buttonsHTML += `<button class="px-3 py-1 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition mr-2"><i class="fa-solid fa-check-circle mr-1"></i> ปลดล็อก</button>`;
            } else if (action === 'kyc') {
                buttonsHTML += `<button class="px-3 py-1 text-xs border border-primary text-primary rounded hover:bg-primary hover:bg-opacity-10 transition"><i class="fa-solid fa-circle-check mr-1"></i> ตรวจ KYC</button>`;
            }
        });

        return `<div class="flex items-center">${buttonsHTML}</div>`;
    }

    // เรนเดอร์ข้อมูลลงตาราง
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = ''; // ล้างข้อความโหลด

    usersData.forEach(user => {
        const typeBadge = user.type === 'Freelancer' 
            ? `<span class="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">${user.type}</span>`
            : `<span class="bg-[#222] text-gray-400 border border-gray-700 px-2 py-1 rounded text-xs">${user.type}</span>`;

        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-800 hover:bg-[#1f1f1f] transition';
        tr.innerHTML = `
            <td class="p-4 text-gray-400">${user.id}</td>
            <td class="p-4">
                <div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                    <i class="fa-regular fa-user"></i>
                </div>
            </td>
            <td class="p-4 font-medium text-white">${user.name}</td>
            <td class="p-4 text-gray-400">${user.email}</td>
            <td class="p-4">${typeBadge}</td>
            <td class="p-4">${generateActionButtons(user.actions)}</td>
        `;
        tbody.appendChild(tr);
    });
});