// ===============================
// BOOKRENT PLATFORM
// FULL JAVASCRIPT SYSTEM
// ===============================

// ===============================
// SAFE GET ELEMENT
// ===============================

function $(id) {
    return document.getElementById(id);
}

// ===============================
// LOADER
// ===============================

window.addEventListener("load", () => {

    setTimeout(() => {

        $("loader").classList.add("hidden");

    }, 1200);

});

// ===============================
// STORAGE & FIREBASE
// ===============================

let users = [];
let books = [];
let reviews = [];
let history = [];

let currentUser =
    JSON.parse(
        localStorage.getItem("bookrent_current_user")
    ) || null;

// Firebase Listeners
db.collection("users").onSnapshot(snapshot => {
    users = snapshot.docs.map(doc => doc.data());
    
    if (currentUser) {
        const updatedUser = users.find(u => u.username === currentUser.username);
        if (updatedUser) {
            currentUser = updatedUser;
            saveCurrentUser();
        }
    }
    
    updateProfileUI();
});

db.collection("books").onSnapshot(snapshot => {
    books = snapshot.docs.map(doc => doc.data());
    renderBooks();
});

db.collection("reviews").onSnapshot(snapshot => {
    reviews = snapshot.docs.map(doc => doc.data());
    renderReviews();
});

db.collection("history").onSnapshot(snapshot => {
    history = snapshot.docs.map(doc => doc.data());
    renderHistory();
});

// ===============================
// SAVE STORAGE
// ===============================

// The old loop-save functions have been removed to prevent massive rewrites.

function saveCurrentUser() {
    localStorage.setItem(
        "bookrent_current_user",
        JSON.stringify(currentUser)
    );
}

// ===============================
// DEFAULT ADMIN
// ===============================

if (!users.find(user => user.username === "admin")) {
    const adminUser = {
        id: 1,
        username: "admin",
        phone: "0000000000",
        password: "0007",
        role: "แอดมิน",
        avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    };
    users.push(adminUser);
    db.collection("users").doc("admin").set(adminUser);
}

// ===============================
// PROFILE UI
// ===============================

function updateProfileUI() {

    const guestButtons =
        $("guestActions"); // Assuming 'guestActions' from HTML instead of 'guestButtons' which doesn't exist

    const userProfile =
        $("userProfile");

    if (currentUser) {

        if(guestButtons) guestButtons.classList.add("hidden");

        if(userProfile) userProfile.classList.remove("hidden");

        if($("userAvatar")) $("userAvatar").src =
            currentUser.avatar ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

        if($("profileName")) $("profileName").textContent =
            currentUser.username;

        if($("profileRole")) $("profileRole").textContent =
            currentUser.role;
            
        if($("profileCredit")) $("profileCredit").textContent =
            "เครดิตมัดจำ: " + (currentUser.depositCredit || 0) + " ฿";

    } else {

        if(guestButtons) guestButtons.classList.remove("hidden");

        if(userProfile) userProfile.classList.add("hidden");

    }

    if (typeof renderHistory === "function") renderHistory();

}

updateProfileUI();

// ===============================
// PROFILE MODAL LOGIC
// ===============================

if($("userProfile")) {
    // Make avatar and name clickable
    if($("userAvatar")) {
        $("userAvatar").style.cursor = "pointer";
        $("userAvatar").addEventListener("click", openProfileModal);
    }
    if($("profileName")) {
        $("profileName").style.cursor = "pointer";
        $("profileName").addEventListener("click", openProfileModal);
    }
}

function openProfileModal() {
    if (!currentUser) return;
    $("profileModal").classList.remove("hidden");
    $("editProfileAvatar").src = currentUser.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    $("editProfileUsername").value = currentUser.username;
    $("editProfilePhone").value = currentUser.phone || "";
}

if($("closeProfileModal")) $("closeProfileModal").addEventListener("click", () => {
    $("profileModal").classList.add("hidden");
});

if($("profileImageInput")) $("profileImageInput").addEventListener("change", function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function() {
        $("editProfileAvatar").src = reader.result;
    };
    reader.readAsDataURL(file);
});

if($("saveProfileBtn")) $("saveProfileBtn").addEventListener("click", () => {
    if (!currentUser) return;
    
    const phone = $("editProfilePhone").value.trim();
    if (!phone) {
        alert("กรุณากรอกเบอร์โทรศัพท์");
        return;
    }
    
    currentUser.phone = phone;
    currentUser.avatar = $("editProfileAvatar").src;
    
    saveCurrentUser();
    
    const uIndex = users.findIndex(u => u.username === currentUser.username);
    if (uIndex !== -1) {
        users[uIndex].phone = currentUser.phone;
        users[uIndex].avatar = currentUser.avatar;
        db.collection("users").doc(currentUser.username).set(users[uIndex]);
    }
    
    updateProfileUI();
    $("profileModal").classList.add("hidden");
    alert("บันทึกข้อมูลส่วนตัวสำเร็จ");
});

// ===============================
// OPEN / CLOSE MODAL
// ===============================

if($("openLoginBtn")) $("openLoginBtn")
    .addEventListener("click", () => {

        $("loginModal")
            .classList.remove("hidden");

    });

if($("closeLoginModal")) $("closeLoginModal")
    .addEventListener("click", () => {

        $("loginModal")
            .classList.add("hidden");

    });

if($("openRegisterBtn")) $("openRegisterBtn")
    .addEventListener("click", () => {

        $("registerModal")
            .classList.remove("hidden");

    });

if($("closeRegisterModal")) $("closeRegisterModal")
    .addEventListener("click", () => {

        $("registerModal")
            .classList.add("hidden");

    });

// ===============================
// TERMS MODAL
// ===============================

if($("openTerms")) $("openTerms")
    .addEventListener("click", () => {

        $("termsModal")
            .classList.remove("hidden");

    });

if($("closeTermsModal")) $("closeTermsModal")
    .addEventListener("click", () => {

        $("termsModal")
            .classList.add("hidden");

    });

// ===============================
// REGISTER SYSTEM
// ===============================

if($("registerBtn")) $("registerBtn")
    .addEventListener("click", () => {

        const username =
            $("registerUsername")
                .value
                .trim();

        const phone =
            $("registerPhone")
                .value
                .trim();

        const password =
            $("registerPassword")
                .value
                .trim();

        const confirmPassword =
            $("registerConfirmPassword")
                .value
                .trim();

        const acceptTerms =
            $("acceptTerms")
                .checked;

        if (
            !username ||
            !phone ||
            !password ||
            !confirmPassword
        ) {

            alert("กรุณากรอกข้อมูลให้ครบ");

            return;

        }

        if (password !== confirmPassword) {

            alert("รหัสผ่านไม่ตรงกัน");

            return;

        }

        if (!acceptTerms) {

            alert(
                "กรุณายอมรับเงื่อนไขการใช้งาน"
            );

            return;

        }

        const alreadyUser =
            users.find(user => {

                return (
                    user.username === username
                );

            });

        if (alreadyUser) {

            alert(
                "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"
            );

            return;

        }

        const newUser = {

            id: Date.now(),

            username,
            phone,
            password,

            role: "ผู้ใช้งาน",
            
            depositCredit: 0,

            avatar:
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"

        };

        users.push(newUser);

        db.collection("users").doc(newUser.username).set(newUser);

        currentUser = newUser;

        saveCurrentUser();

        updateProfileUI();

        $("registerModal")
            .classList.add("hidden");

        alert("สมัครบัญชีสำเร็จ");

    });

// ===============================
// LOGIN SYSTEM
// ===============================

if($("loginBtn")) $("loginBtn")
    .addEventListener("click", () => {

        const username =
            $("loginUsername")
                .value
                .trim();

        const password =
            $("loginPassword")
                .value
                .trim();

        const user =
            users.find(user => {

                return (
                    user.username === username &&
                    user.password === password
                );

            });

        if (!user) {

            alert(
                "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
            );

            return;

        }

        currentUser = user;

        saveCurrentUser();

        if (currentUser.role === "แอดมิน") {
            window.location.href = "admin.html";
            return;
        }

        updateProfileUI();

        $("loginModal")
            .classList.add("hidden");

        alert("เข้าสู่ระบบสำเร็จ");

    });

// ===============================
// LOGOUT
// ===============================

if($("logoutBtn")) $("logoutBtn")
    .addEventListener("click", () => {

        currentUser = null;

        saveCurrentUser();

        updateProfileUI();

        alert("ออกจากระบบแล้ว");

    });

// ===============================
// PREVIEW IMAGE
// ===============================

if($("bookImage")) $("bookImage")
    .addEventListener("change", function () {

        const file =
            this.files[0];

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload = function () {

            $("previewImage").src =
                reader.result;

            $("previewImage")
                .classList.remove("hidden");

        };

        reader.readAsDataURL(file);

    });

// ===============================
// RENT PACKAGES TOGGLE
// ===============================

if($("package7")) $("package7").addEventListener("change", function() {
    if (this.checked) {
        $("price7").classList.remove("hidden");
    } else {
        $("price7").classList.add("hidden");
        $("price7").value = "";
    }
});

if($("package14")) $("package14").addEventListener("change", function() {
    if (this.checked) {
        $("price14").classList.remove("hidden");
    } else {
        $("price14").classList.add("hidden");
        $("price14").value = "";
    }
});

// ===============================
// TELEGRAM NOTIFY
// ===============================

async function sendTelegramNotification(book) {

    // ===============================
    // ใส่ TOKEN และ CHAT ID
    // ===============================

    const BOT_TOKEN =
        "YOUR_BOT_TOKEN";

    const CHAT_ID =
        "YOUR_CHAT_ID";

    const message =
        `
📚 มีหนังสือใหม่รอตรวจสอบ

📖 ชื่อ:
${book.title}

✍️ ผู้เขียน:
${book.author}

👤 ผู้ปล่อย:
${book.owner}

💰 มัดจำ:
${book.deposit} บาท

📚 หมวด:
${book.category}
`;

    try {

        await fetch(

            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,

            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    chat_id: CHAT_ID,

                    text: message

                })

            }

        );

    } catch (error) {

        console.log(
            "Telegram Error",
            error
        );

    }

}

// ===============================
// SUBMIT BOOK
// ===============================

if($("bookForm")) $("bookForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        if (!currentUser) {

            alert(
                "กรุณา Login ก่อน"
            );

            return;

        }

        const title =
            $("bookTitle")
                .value
                .trim();

        const author =
            $("bookAuthor")
                .value
                .trim();

        const description =
            $("bookDescription")
                .value
                .trim();

        const deposit =
            $("bookDeposit")
                .value;

        const hasPackage7 = $("package7") && $("package7").checked;
        const price7 = hasPackage7 ? $("price7").value : null;
        
        const hasPackage14 = $("package14") && $("package14").checked;
        const price14 = hasPackage14 ? $("price14").value : null;

        if (!hasPackage7 && !hasPackage14) {
            alert("กรุณาเลือกแพ็กเกจค่าเช่าอย่างน้อย 1 อย่าง");
            return;
        }

        if ((hasPackage7 && !price7) || (hasPackage14 && !price14)) {
            alert("กรุณากรอกราคาสำหรับแพ็กเกจที่เลือก");
            return;
        }

        const image =
            $("previewImage").src;

        const checked =
            document.querySelectorAll(
                ".multi-category input:checked"
            );

        const category =
            Array.from(checked)
                .map(item => item.value)
                .join(", ");

        const file = $("bookImage").files[0];

        if (!file) {

            alert(
                "กรุณาอัปโหลดรูปหนังสือ"
            );

            return;

        }

        if (!category) {

            alert(
                "กรุณาเลือกหมวดหมู่"
            );

            return;

        }

        const newBook = {

            id: Date.now(),

            title,
            author,
            description,
            category,
            deposit,
            hasPackage7,
            price7: price7 ? Number(price7) : 0,
            hasPackage14,
            price14: price14 ? Number(price14) : 0,
            image,

            owner:
                currentUser.username,

            status: "pending"

        };

        books.push(newBook);

        db.collection("books").doc(newBook.id.toString()).set(newBook);

        // ===============================
        // SEND TELEGRAM
        // ===============================

        sendTelegramNotification(
            newBook
        );

        $("statusMessage").innerHTML =

            `
        <div class="success-box">
            ✅ ส่งข้อมูลสำเร็จ
            รอแอดมินตรวจสอบ
        </div>
    `;

        $("bookForm").reset();

        $("previewImage")
            .classList.add("hidden");

    });

// ===============================
// RENDER BOOKS
// ===============================

function renderBooks() {

    if(!$("books")) return;

    $("books").innerHTML = "";

    const approvedBooks =
        books.filter(book => {

            return (
                book.status === "approved"
            );

        });

    if (
        approvedBooks.length === 0
    ) {

        $("books").innerHTML =

            `
        <div class="empty-box">
            <h2>
                ยังไม่มีหนังสือในระบบ
            </h2>
        </div>
    `;

        return;

    }

    approvedBooks.forEach(book => {

        const card =
            document.createElement("div");

        card.className =
            "book-card";

        card.setAttribute(
            "data-category",
            book.category
        );

        card.innerHTML = `

        <img src="${book.image}">

        <div class="book-content">

            <h3>
                ${book.title}
            </h3>

            <p>
                ผู้เขียน:
                ${book.author}
            </p>

            <p>
                หมวด:
                ${book.category}
            </p>

            <p class="deposit">
                มัดจำ ${book.deposit} บาท
            </p>

            <button type="button" class="rent-btn">
                เช่าหนังสือ
            </button>

        </div>

        `;

        const rentBtn = card.querySelector(".rent-btn");
        if (rentBtn) {
            rentBtn.addEventListener("click", (e) => {
                e.preventDefault();
                openRentModal(book);
            });
        }

        $("books")
            .appendChild(card);

    });

}

renderBooks();

// ===============================
// CATEGORY FILTER
// ===============================

const categoryButtons =
    document.querySelectorAll(
        ".category-btn"
    );

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        const category =
            button.dataset.category;

        const cards =
            document.querySelectorAll(
                ".book-card"
            );

        cards.forEach(card => {

            if (

                category === "all" ||

                card.dataset.category.includes(
                    category
                )

            ) {

                card.style.display =
                    "block";

            } else {

                card.style.display =
                    "none";

            }

        });

    });

});

// ===============================
// SEARCH
// ===============================

if($("searchBtn")) $("searchBtn")
    .addEventListener(
        "click",
        searchBooks
    );

if($("searchInput")) $("searchInput")
    .addEventListener(
        "keyup",
        searchBooks
    );

function searchBooks() {

    const keyword =
        $("searchInput")
            .value
            .toLowerCase();

    const cards =
        document.querySelectorAll(
            ".book-card"
        );

    cards.forEach(card => {

        const text =
            card.innerText
                .toLowerCase();

        if (
            text.includes(keyword)
        ) {

            card.style.display =
                "block";

        } else {

            card.style.display =
                "none";

        }

    });

}



// ===============================
// WITHDRAW SYSTEM
// ===============================

if($("openWithdrawBtn")) $("openWithdrawBtn").addEventListener("click", () => {
    if (!currentUser || currentUser.depositCredit <= 0) {
        alert("คุณไม่มีเครดิตมัดจำให้ถอน");
        return;
    }
    $("withdrawAmount").max = currentUser.depositCredit;
    $("withdrawModal").classList.remove("hidden");
});

if($("closeWithdrawModal")) $("closeWithdrawModal").addEventListener("click", () => {
    $("withdrawModal").classList.add("hidden");
});

if($("confirmWithdrawBtn")) $("confirmWithdrawBtn").addEventListener("click", () => {
    const amount = Number($("withdrawAmount").value);
    const bank = $("withdrawBank").value;
    const accountNo = $("withdrawAccountNo").value.trim();
    const accountName = $("withdrawAccountName").value.trim();

    if (!amount || !bank || !accountNo || !accountName) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    if (amount <= 0 || amount > Number(currentUser.depositCredit)) {
        alert("ยอดเงินไม่ถูกต้อง หรือเกินกว่าเครดิตที่มี");
        return;
    }

    if (confirm(`ยืนยันการถอนเงินจำนวน ${amount} บาท ไปยังบัญชี ${bank} (${accountNo}) ใช่หรือไม่?`)) {
        
        currentUser.depositCredit = Number(currentUser.depositCredit) - amount;
        saveCurrentUser();
        
        const uIndex = users.findIndex(u => u.username === currentUser.username);
        if (uIndex !== -1) {
            users[uIndex].depositCredit = currentUser.depositCredit;
            db.collection("users").doc(currentUser.username).set(users[uIndex]);
            updateProfileUI();
        }

        const withdrawData = {
            id: Date.now(),
            username: currentUser.username,
            amount: amount,
            bank: bank,
            accountNo: accountNo,
            accountName: accountName,
            status: "รอโอนเงิน",
            timestamp: new Date().toISOString()
        };

        db.collection("withdrawals").doc(withdrawData.id.toString()).set(withdrawData).then(() => {
            alert("ส่งคำขอถอนเงินเรียบร้อยแล้ว กรุณารอแอดมินดำเนินการโอนเงิน");
            $("withdrawModal").classList.add("hidden");
            
            $("withdrawAmount").value = "";
            $("withdrawBank").value = "";
            $("withdrawAccountNo").value = "";
            $("withdrawAccountName").value = "";
        }).catch(err => {
            alert("เกิดข้อผิดพลาดในการส่งคำขอถอนเงิน");
            console.error(err);
        });
    }
});

// ===============================
// RENT SYSTEM
// ===============================

let selectedBook = null;
let selectedRentPackage = null;
let currentRentPrice = 0;

function openRentModal(book) {
    if (!currentUser) {
        alert("กรุณา Login ก่อน");
        return;
    }

    selectedBook = book;
    selectedRentPackage = null;
    currentRentPrice = 0;

    $("rentModal").classList.remove("hidden");
    $("rentBookImage").src = book.image;
    $("rentBookTitle").textContent = book.title;
    $("rentBookAuthor").textContent = "ผู้เขียน: " + book.author;
    $("rentBookCategory").textContent = "หมวด: " + book.category;
    $("rentBookDeposit").textContent = "มัดจำ: " + book.deposit + " บาท";

    let packageHTML = '';
    if (book.hasPackage7) {
        packageHTML += `<label style="display:flex; gap:8px; margin-bottom:8px; cursor:pointer;"><input type="radio" name="rentPkg" value="7" data-price="${book.price7}"> ระยะสั้น 1-7 วัน (ค่าเช่า ${book.price7} บาท)</label>`;
    }
    if (book.hasPackage14) {
        packageHTML += `<label style="display:flex; gap:8px; margin-bottom:8px; cursor:pointer;"><input type="radio" name="rentPkg" value="14" data-price="${book.price14}"> ระยะยาว 7-14 วัน (ค่าเช่า ${book.price14} บาท)</label>`;
    }
    if (!book.hasPackage7 && !book.hasPackage14) {
        packageHTML = '<p style="color:#ef4444;">ไม่มีแพ็กเกจเช่า</p>';
    }
    $("rentPackageSelection").innerHTML = packageHTML;

    const radios = document.querySelectorAll('input[name="rentPkg"]');
    radios.forEach(r => r.addEventListener('change', function() {
        selectedRentPackage = this.value;
        currentRentPrice = Number(this.dataset.price);
        updateRentSummary();
    }));

    updateRentSummary();
}

function updateRentSummary() {
    const credit = Number(currentUser.depositCredit || 0);
    const deposit = Number(selectedBook.deposit || 0);
    const rent = currentRentPrice;
    
    let requiredDeposit = deposit - credit;
    if (requiredDeposit < 0) requiredDeposit = 0;
    
    const total = requiredDeposit + rent;
    
    if($("rentSummaryCredit")) $("rentSummaryCredit").textContent = "เครดิตมัดจำที่มี: " + credit + " บาท";
    if($("rentSummaryDeposit")) $("rentSummaryDeposit").textContent = "ค้างมัดจำเพิ่ม: " + requiredDeposit + " บาท";
    if($("rentSummaryRent")) $("rentSummaryRent").textContent = "ค่าเช่า: " + rent + " บาท";
    if($("rentSummaryTotal")) $("rentSummaryTotal").textContent = "ยอดที่ต้องโอน: " + total + " บาท";
}

// ===============================
// CLOSE RENT
// ===============================

if($("closeRentModal")) $("closeRentModal")
    .addEventListener("click", () => {

        $("rentModal")
            .classList.add("hidden");

    });

// ===============================
// CONFIRM RENT
// ===============================

if($("confirmRentBtn")) $("confirmRentBtn")
    .addEventListener("click", () => {
        
        if (!selectedRentPackage) {
            alert("กรุณาเลือกระยะเวลาเช่า");
            return;
        }

        const name =
            $("shippingName")
                .value
                .trim();

        const phone =
            $("shippingPhone")
                .value
                .trim();

        const address =
            $("shippingAddress")
                .value
                .trim();

        if (
            !name ||
            !phone ||
            !address
        ) {

            alert(
                "กรอกข้อมูลจัดส่งให้ครบ"
            );

            return;

        }

        $("paymentModal")
            .classList.remove("hidden");
            
        startTimer();

    });

// ===============================
// CLOSE PAYMENT
// ===============================

if($("closePaymentModal")) $("closePaymentModal")
    .addEventListener("click", () => {

        clearInterval(countdown);

        $("paymentModal")
            .classList.add("hidden");

    });

// ===============================
// TIMER
// ===============================

let countdown;

function startTimer() {

    let time = 300;

    clearInterval(countdown);

    countdown = setInterval(() => {

        let minutes =
            Math.floor(time / 60);

        let seconds =
            time % 60;

        minutes =
            minutes < 10 ?
            "0" + minutes :
            minutes;

        seconds =
            seconds < 10 ?
            "0" + seconds :
            seconds;

        if($("timer")) $("timer").textContent =
            `${minutes}:${seconds}`;

        time--;

        if (time < 0) {

            clearInterval(countdown);

            alert(
                "หมดเวลาชำระเงิน"
            );

            if($("paymentModal")) $("paymentModal")
                .classList.add("hidden");

        }

    }, 1000);

}

// ===============================
// CONFIRM PAYMENT
// ===============================

if($("confirmPaymentBtn")) $("confirmPaymentBtn")
    .addEventListener("click", () => {
        const slip = $("paymentSlip").files[0];
        if (!slip) {
            alert("กรุณาอัปโหลดสลิป");
            return;
        }

        const reader = new FileReader();
        reader.onload = function() {
            const slipImageBase64 = reader.result;

            const credit = Number(currentUser.depositCredit || 0);
            const deposit = Number(selectedBook.deposit || 0);
            const usedCredit = Math.min(deposit, credit);
            
            currentUser.depositCredit = credit - usedCredit;
            saveCurrentUser();
            
            const uIndex = users.findIndex(u => u.username === currentUser.username);
            if (uIndex !== -1) {
                users[uIndex].depositCredit = currentUser.depositCredit;
                db.collection("users").doc(users[uIndex].username).set(users[uIndex]);
                updateProfileUI();
            }

            const rentData = {
                id: Date.now(),
                bookId: selectedBook.id,
                username: currentUser.username,
                image: selectedBook.image,
                bookTitle: selectedBook.title,
                deposit: deposit,
                rentPrice: currentRentPrice,
                rentPackage: selectedRentPackage,
                status: "ชำระเงินแล้ว",
                slipImage: slipImageBase64
            };

            history.unshift(rentData);
            db.collection("history").doc(rentData.id.toString()).set(rentData);
            
            const bookIndex = books.findIndex(b => b.id === selectedBook.id);
            if (bookIndex !== -1) {
                books[bookIndex].status = "rented";
                db.collection("books").doc(books[bookIndex].id.toString()).set(books[bookIndex]);
                renderBooks();
            }

            renderHistory();
            clearInterval(countdown);

            $("paymentModal").classList.add("hidden");
            $("rentModal").classList.add("hidden");
            alert("ชำระเงินสำเร็จ");
        };
        reader.readAsDataURL(slip);
    });

// ===============================
// RENDER HISTORY
// ===============================

function renderHistory() {

    if(!$("historyGrid")) return;

    $("historyGrid").innerHTML = "";

    if (!currentUser) {
        $("historyGrid").innerHTML = `
        <div class="empty-box">
            <h2>
                กรุณาเข้าสู่ระบบเพื่อดูประวัติการเช่า
            </h2>
        </div>
        `;
        return;
    }

    const userHistory = history.filter(item => item.username === currentUser.username);

    if (userHistory.length === 0) {
        $("historyGrid").innerHTML = `
        <div class="empty-box">
            <h2>
                คุณยังไม่มีประวัติการเช่า
            </h2>
        </div>
        `;
        return;
    }

    userHistory.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "history-card";

        let actionBtn = "";
        if (item.status === "ชำระเงินแล้ว" && currentUser && item.username === currentUser.username) {
            actionBtn = `<button type="button" class="return-btn" onclick="returnBookByUser(${item.id})" style="background-color: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; margin-top: 10px; font-weight: 500; width: 100%;">แจ้งคืนหนังสือ</button>`;
        } else if (item.status === "รอรับคืน" && currentUser && item.username === currentUser.username) {
            actionBtn = `<p style="font-size: 0.85rem; color: #ea580c; margin-top: 10px; font-weight: 500; text-align: center;">รอแอดมินตรวจสอบการคืน</p>`;
        }
        
        let packageText = "-";
        if (item.rentPackage === "7") packageText = "1-7 วัน";
        if (item.rentPackage === "14") packageText = "7-14 วัน";

        card.innerHTML = `

        <img src="${item.image}">

        <div class="history-content">

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: #f8fafc; padding: 10px 14px; border-radius: 12px; border: 1px dashed #cbd5e1;">
                <span style="font-weight: 700; color: #1e3a8a; font-size: 1rem;" id="rent-id-${item.id}">#BK-${item.id}</span>
                <button onclick="copyToClipboard('#BK-${item.id}')" style="background: transparent; border: none; color: #3b82f6; cursor: pointer; font-size: 1.1rem; transition: 0.2s;" title="คัดลอกรหัส"><i class="fa-regular fa-copy"></i></button>
            </div>

            <h3>
                ${item.bookTitle}
            </h3>

            <p>
                👤 ${item.username}
            </p>
            
            <p style="font-size: 0.85rem; color: #475569; margin-top: 4px;">
                ⏱️ เช่าแบบ: ${packageText}
            </p>

            <p style="margin-top: 4px;">
                💰 มัดจำ ${item.deposit} | ค่าเช่า ${item.rentPrice || 0} ฿
            </p>

            <p class="paid-status" style="margin-top: 4px; display: inline-block; padding: 4px 10px; background: #dcfce7; color: #166534; border-radius: 99px; font-size: 0.85rem; font-weight: 600;">
                ${item.status}
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px;">
                <a href="track.html?id=%23BK-${item.id}" target="_blank" style="width: 100%; text-align: center; text-decoration: none; background-color: #3b82f6; color: white; padding: 10px; border-radius: 12px; font-size: 0.9rem; font-weight: 600; transition: 0.2s; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2); display: block;"><i class="fa-solid fa-truck-fast"></i> ติดตามสถานะ</a>
                ${actionBtn}
            </div>

        </div>

        `;

        $("historyGrid")
            .appendChild(card);

    });

}

renderHistory();

// ===============================
// COPY TO CLIPBOARD
// ===============================

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("คัดลอกรหัส " + text + " สำเร็จ!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
};

window.returnBookByUser = function(historyId) {
    if (!confirm("ยืนยันการแจ้งคืนหนังสือ? ระบบจะส่งเรื่องให้แอดมินตรวจสอบ เมื่อแอดมินรับคืนแล้ว เครดิตมัดจำจะถูกเพิ่มเข้าบัญชีของคุณ")) return;
    
    const hItem = history.find(h => h.id === historyId);
    if (hItem) {
        hItem.status = "รอรับคืน";
        db.collection("history").doc(hItem.id.toString()).set(hItem);
        
        renderHistory();
        alert("แจ้งคืนหนังสือสำเร็จ! กรุณารอแอดมินตรวจสอบการคืนหนังสือ");
    }
}

// ===============================
// REVIEW SYSTEM
// ===============================

let selectedStars = 0;

const stars =
    document.querySelectorAll(
        ".star-select span"
    );

stars.forEach(star => {

    star.addEventListener("click", () => {

        selectedStars =
            star.dataset.star;

        stars.forEach(s => {

            s.classList.remove("active");

        });

        for (
            let i = 0;
            i < selectedStars;
            i++
        ) {

            stars[i]
                .classList.add("active");

        }

    });

});

// ===============================
// SUBMIT REVIEW
// ===============================

if($("submitReviewBtn")) $("submitReviewBtn")
    .addEventListener("click", () => {

        if (!currentUser) {

            alert(
                "กรุณา Login ก่อน"
            );

            return;

        }

        const message =
            $("reviewMessage")
                .value
                .trim();

        if (
            !message ||
            selectedStars == 0
        ) {

            alert(
                "กรอกข้อความและเลือกดาว"
            );

            return;

        }

        const review = {
            id: Date.now(),
            user: currentUser.username,
            message,
            stars: selectedStars,
            avatar: currentUser.avatar
        };

        reviews.unshift(review);

        db.collection("reviews").doc(review.id.toString()).set(review);

        renderReviews();

        $("reviewMessage").value =
            "";

        selectedStars = 0;

        stars.forEach(s => {

            s.classList.remove("active");

        });

    });

// ===============================
// STORE RATE SUMMARY
// ===============================

function updateStoreRate() {
    const summaryContainer = $("storeRateSummary");
    if (!summaryContainer) return;

    if (reviews.length === 0) {
        summaryContainer.innerHTML = `
            <div>
                <h3>-</h3>
                <div class="stars">★★★★★</div>
                <p>ยังไม่มีรีวิว</p>
            </div>
        `;
        return;
    }

    let totalStars = 0;
    reviews.forEach(review => {
        totalStars += parseInt(review.stars);
    });

    const average = (totalStars / reviews.length).toFixed(1);
    
    // Calculate full stars
    const fullStars = Math.round(average);
    let starHTML = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starHTML += "★";
        } else {
            starHTML += "☆";
        }
    }

    summaryContainer.innerHTML = `
        <div>
            <h3>${average}</h3>
            <div class="stars">${starHTML}</div>
            <p>จากทั้งหมด ${reviews.length} รีวิว</p>
        </div>
    `;
}

// ===============================
// RENDER REVIEWS
// ===============================

function renderReviews() {

    if(!$("reviewList")) return;

    $("reviewList").innerHTML = "";

    reviews.forEach(review => {

        let starHTML = "";

        for (
            let i = 0;
            i < review.stars;
            i++
        ) {

            starHTML += "★";

        }

        const card =
            document.createElement("div");

        card.className =
            "review-card";

        card.innerHTML = `

        <div class="review-top">

            <div class="review-user-box">

                <img src="${review.avatar}">

                <div>

                    <h4>
                        ${review.user}
                    </h4>

                    <div class="review-stars">

                        ${starHTML}

                    </div>

                </div>

            </div>

        </div>

        <div class="review-text">

            ${review.message}

        </div>

        `;

        $("reviewList")
            .appendChild(card);

    });
    
    updateStoreRate();

}

renderReviews();
