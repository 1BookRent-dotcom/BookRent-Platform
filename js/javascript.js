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

function saveUsers() {
    users.forEach(user => {
        db.collection("users").doc(user.username).set(user);
    });
}

function saveBooks() {
    books.forEach(book => {
        db.collection("books").doc(book.id.toString()).set(book);
    });
}

function saveReviews() {
    reviews.forEach(review => {
        db.collection("reviews").doc(review.id ? review.id.toString() : Date.now().toString()).set(review);
    });
}

function saveHistory() {
    history.forEach(item => {
        db.collection("history").doc(item.id.toString()).set(item);
    });
}

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

    users.push({

        id: 1,
        username: "admin",
        phone: "0000000000",
        password: "0007",
        role: "แอดมิน",
        avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"

    });

    saveUsers();

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

    } else {

        if(guestButtons) guestButtons.classList.remove("hidden");

        if(userProfile) userProfile.classList.add("hidden");

    }

}

updateProfileUI();

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

            avatar:
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"

        };

        users.push(newUser);

        saveUsers();

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
            image,

            owner:
                currentUser.username,

            status: "pending"

        };

        books.push(newBook);

        saveBooks();

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
// RENT SYSTEM
// ===============================

let selectedBook = null;

function openRentModal(book) {

    if (!currentUser) {

        alert(
            "กรุณา Login ก่อน"
        );

        return;

    }

    selectedBook = book;

    $("rentModal")
        .classList.remove("hidden");

    $("rentBookImage").src =
        book.image;

    $("rentBookTitle").textContent =
        book.title;

    $("rentBookAuthor").textContent =
        "ผู้เขียน: " + book.author;

    $("rentBookCategory").textContent =
        "หมวด: " + book.category;

    $("rentBookDeposit").textContent =
        "มัดจำ: " +
        book.deposit +
        " บาท";

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

        const slip =
            $("paymentSlip")
                .files[0];

        if (!slip) {

            alert(
                "กรุณาอัปโหลดสลิป"
            );

            return;

        }

        const rentData = {

            id: Date.now(),

            username:
                currentUser.username,

            image:
                selectedBook.image,

            bookTitle:
                selectedBook.title,

            deposit:
                selectedBook.deposit,

            status:
                "ชำระเงินแล้ว"

        };

        history.unshift(rentData);

        saveHistory();
        
        const bookIndex = books.findIndex(b => b.id === selectedBook.id);
        if (bookIndex !== -1) {
            books[bookIndex].status = "rented";
            saveBooks();
            renderBooks();
        }

        renderHistory();

        clearInterval(countdown);

        $("paymentModal")
            .classList.add("hidden");

        $("rentModal")
            .classList.add("hidden");

        alert(
            "ชำระเงินสำเร็จ"
        );

    });

// ===============================
// RENDER HISTORY
// ===============================

function renderHistory() {

    if(!$("historyGrid")) return;

    $("historyGrid").innerHTML = "";

    if (
        history.length === 0
    ) {

        $("historyGrid").innerHTML =

            `
        <div class="empty-box">
            <h2>
                ยังไม่มีประวัติ
            </h2>
        </div>
    `;

        return;

    }

    history.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "history-card";

        card.innerHTML = `

        <img src="${item.image}">

        <div class="history-content">

            <h3>
                ${item.bookTitle}
            </h3>

            <p>
                👤 ${item.username}
            </p>

            <p>
                💰 ${item.deposit} บาท
            </p>

            <p class="paid-status">
                ${item.status}
            </p>

        </div>

        `;

        $("historyGrid")
            .appendChild(card);

    });

}

renderHistory();

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

            user:
                currentUser.username,

            message,

            stars:
                selectedStars,

            avatar:
                currentUser.avatar

        };

        reviews.unshift(review);

        saveReviews();

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
