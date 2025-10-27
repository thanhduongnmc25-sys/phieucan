document.addEventListener('DOMContentLoaded', () => {

    // --- KHAI BÁO BIẾN CHO CÁC ELEMENT ---
    const selectKip = document.getElementById('select-kip');
    const selectNhaCan = document.getElementById('select-nha-can');
    const inputA5 = document.getElementById('input-a5');
    const inputNhamay = document.getElementById('input-nhamay');
    const inputXuong = document.getElementById('input-xuong');
    const inputNoinhan = document.getElementById('input-noinhan');
    const inputM9 = document.getElementById('input-m9');
    const btnXlsx = document.getElementById('btn-xlsx');
    const btnPdf = document.getElementById('btn-pdf');
    const statusEl = document.getElementById('status');
    const btnCopy = document.getElementById('btn-copy');
    
    // Nút điều hướng và các trang
    const navNhapLieu = document.getElementById('nav-nhap-lieu');
    const navKhac = document.getElementById('nav-khac');
    const pageNhapLieu = document.getElementById('page-nhap-lieu');
    const pageKhac = document.getElementById('page-khac');
    const allPages = document.querySelectorAll('.page-content'); 
    const allNavButtons = document.querySelectorAll('.navbar button'); 

    // Element cho hiệu ứng gõ chữ
    const typedTextSpan = document.getElementById("typed-text");
    const cursorSpan = document.querySelector(".cursor"); // Lấy cursor

    // --- LOGIC CHUYỂN TRANG ---
    function showPage(pageIdToShow) {
        allPages.forEach(page => {
            if(page) page.classList.remove('active');
        });
        allNavButtons.forEach(button => {
             if(button) button.classList.remove('active');
        });
        const pageToShow = document.getElementById(pageIdToShow);
        if (pageToShow) {
            pageToShow.classList.add('active');
        }
        const navButtonId = `nav-${pageIdToShow.split('-').slice(1).join('-')}`; 
        const navButtonToActive = document.getElementById(navButtonId);
         if (navButtonToActive) {
            navButtonToActive.classList.add('active');
        }
    }
    if (navNhapLieu) navNhapLieu.addEventListener('click', () => showPage('page-nhap-lieu'));
    if (navKhac) navKhac.addEventListener('click', () => showPage('page-khac'));
    if (pageNhapLieu) { showPage('page-nhap-lieu'); } 
    else { console.error("Không tìm thấy #page-nhap-lieu"); }

    // --- HÀM CẬP NHẬT Ô A5 ---
    function updateA5() {
        if (!selectKip || !selectNhaCan || !inputA5) return;
        const kipValue = selectKip.value;
        const nhaCanValue = selectNhaCan.value;
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1; 
        const year = today.getFullYear();
        inputA5.value = `Kíp ${kipValue} Ngày ${day} tháng ${month} năm ${year}_NC số: ${nhaCanValue}`;
    }

    // --- HÀM CẬP NHẬT Ô GHI CHÚ ---
    function updateGhiChu() {
        if (!inputNhamay || !inputXuong || !selectNhaCan || !inputNoinhan || !inputM9) return;
        const nhaMayValue = inputNhamay.value;
        const xuongValue = inputXuong.value;
        const nhaCanValue = selectNhaCan.value; 
        const noiNhanValue = inputNoinhan.value;
        inputM9.value = `${nhaMayValue}(${xuongValue}) =>${nhaCanValue}=>${noiNhanValue}`;
    }
    
    // Gắn sự kiện và chạy lần đầu
    if (selectKip) selectKip.addEventListener('change', updateA5);
    if (selectNhaCan) selectNhaCan.addEventListener('change', () => { updateA5(); updateGhiChu(); }); 
    if (inputNhamay) inputNhamay.addEventListener('input', updateGhiChu);
    if (inputXuong) inputXuong.addEventListener('input', updateGhiChu);
    if (inputNoinhan) inputNoinhan.addEventListener('input', updateGhiChu);
    updateA5(); 
    updateGhiChu(); 

    // --- HÀM GỌI API ĐỂ TẠO FILE (generateFile) ---
     async function generateFile(format) {
        if (statusEl) {
            statusEl.textContent = `Đang xử lý tạo file ${format.toUpperCase()}, vui lòng chờ...`;
            statusEl.style.color = 'blue';
        }
        const getDataValue = (id) => document.getElementById(id)?.value || '';
        const data = {
            a5: getDataValue('input-a5'), b9: getDataValue('input-b9'), c9: getDataValue('input-c9'), d9: getDataValue('input-d9'), e9: getDataValue('input-e9'), f9: getDataValue('input-f9'), g9: getDataValue('input-g9'), h9: getDataValue('input-h9'), i9: getDataValue('input-i9'), j9: getDataValue('input-j9'), k9: getDataValue('input-k9'), l9: getDataValue('input-l9'), m9: getDataValue('input-m9'), truongKip: getDataValue('input-truongkip'), 
        };
        try {
            const response = await fetch('/api/generate', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ data, format }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi máy chủ: ${errorText}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
             const contentDisposition = response.headers.get('content-disposition');
             let filename = `NhuCauCanHang_${Date.now()}.${format}`; 
             if (contentDisposition) {
                 const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                 const matches = filenameRegex.exec(contentDisposition);
                 if (matches != null && matches[1]) { 
                   filename = matches[1].replace(/['"]/g, '');
                 }
             }
             a.download = filename; 
            document.body.appendChild(a);
            a.click(); 
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            if (statusEl) {
                statusEl.textContent = 'Hoàn thành! Đã tải file.';
                statusEl.style.color = 'green';
            }
        } catch (error) {
            console.error('Lỗi khi tạo file:', error);
            if (statusEl) {
                statusEl.textContent = `Lỗi: ${error.message}`;
                statusEl.style.color = 'red';
            }
        }
    }
    
    // --- HÀM COPY DỮ LIỆU ---
     function copyData() {
        try {
            const nhaCanSelect = document.getElementById('select-nha-can');
            const nhaCanText = nhaCanSelect ? nhaCanSelect.options[nhaCanSelect.selectedIndex].text : 'N/A'; 
            const getDataValue = (id) => document.getElementById(id)?.value || '';
            const truongKip = getDataValue('input-truongkip');
            const cccd = getDataValue('input-g9');
            const khachHang = getDataValue('input-e9');
            const noiDung = getDataValue('input-b9'); 
            const chungLoai = getDataValue('input-d9'); 
            const daiDien = getDataValue('input-f9');
            const bsx = getDataValue('input-h9');
            const donViVanChuyen = getDataValue('input-i9');
            const ghiChu = getDataValue('input-m9'); 
            const textToCopy = `Gửi ACE ${nhaCanText}, ${truongKip} đăng kí thông tin cân hàng như sau:
Nội dung cân: ${noiDung}
Hàng hoá : ${chungLoai}
Khách hàng: ${khachHang}
Đại diện: ${daiDien}
Biển số xe: ${bsx};
Đơn vị vận chuyển :${donViVanChuyen}
Ghi chú: ${ghiChu}
Trân trọng!`;
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            let success = false;
            try { success = document.execCommand('copy'); } 
            catch (err) { console.error('Không thể copy:', err); }
            document.body.removeChild(textArea);
            if (statusEl) {
                if (success) {
                    statusEl.textContent = 'Đã copy nội dung vào clipboard!';
                    statusEl.style.color = 'green';
                } else { throw new Error('Không thể tự động copy.'); }
            }
        } catch (error) {
            console.error('Lỗi khi copy:', error);
            if (statusEl) {
                statusEl.textContent = `Lỗi: ${error.message}`;
                statusEl.style.color = 'red';
            }
        }
    }

     // Gắn sự kiện cho các nút trong trang nhập liệu (nếu chúng tồn tại)
     if(btnXlsx) btnXlsx.addEventListener('click', () => generateFile('xlsx'));
     if(btnPdf) btnPdf.addEventListener('click', () => generateFile('pdf'));
     if(btnCopy) btnCopy.addEventListener('click', copyData); 

    // --- BẮT ĐẦU LOGIC HIỆU ỨNG GÕ CHỮ ---
    if (typedTextSpan && cursorSpan) {
        const textsToType = [
             // Bọc toàn bộ câu trong span để đổi màu
            "<span class='animated-text'>Chào mừng đến với ứng dụng Nhập Liệu Cân Hàng!</span>", 
            "<span class='animated-text'>Chúc bạn một ngày làm việc hiệu quả!</span>", 
            "<span class='animated-text'>Liên hệ: Nguyễn Thanh Dương - HPDQ01016</span>" 
        ];
        let textArrayIndex = 0;
        let charIndex = 0;
        const typingDelay = 100; // Tốc độ gõ (ms)
        const erasingDelay = 50; // Tốc độ xóa (ms)
        const newTextDelay = 2000; // Thời gian chờ trước khi gõ câu mới (ms)

        function type() {
            if (charIndex < textsToType[textArrayIndex].length) {
                // Nếu chưa gõ xong câu hiện tại
                typedTextSpan.innerHTML = textsToType[textArrayIndex].substring(0, charIndex + 1); // Hiển thị dần
                charIndex++;
                setTimeout(type, typingDelay);
            } else {
                // Đã gõ xong câu hiện tại -> đợi rồi xóa
                cursorSpan.style.animationPlayState = 'paused'; // Tạm dừng nhấp nháy
                setTimeout(erase, newTextDelay);
            }
        }

        function erase() {
            if (charIndex > 0) {
                 // Nếu chưa xóa hết câu hiện tại
                typedTextSpan.innerHTML = textsToType[textArrayIndex].substring(0, charIndex - 1); // Xóa dần
                charIndex--;
                 setTimeout(erase, erasingDelay);
            } else {
                // Đã xóa hết câu -> chuyển câu mới và bắt đầu gõ
                cursorSpan.style.animationPlayState = 'running'; // Bật lại nhấp nháy
                textArrayIndex++;
                if (textArrayIndex >= textsToType.length) textArrayIndex = 0; // Quay lại câu đầu tiên
                setTimeout(type, typingDelay + 500); // Đợi chút trước khi gõ câu mới
            }
        }

        // Bắt đầu hiệu ứng
        setTimeout(type, newTextDelay / 2); // Bắt đầu nhanh hơn chút
    } else {
        console.error("Không tìm thấy #typed-text hoặc .cursor");
    }
    // --- KẾT THÚC LOGIC HIỆU ỨNG GÕ CHỮ ---

}); // Kết thúc DOMContentLoaded