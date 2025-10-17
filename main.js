class Product {
    constructor(id, name, price, image, category, hot, description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.category = category;
        this.hot = hot;
        this.description = description;
    }

    toHTML() {
        const priceFormatted = this.price.toLocaleString('vi-VN');
        const hotBadge = this.hot ? '<div class="hot-badge">HOT</div>' : '';

        return `
            <div class="product">
                ${hotBadge}
                <img src="${this.image}" alt="${this.name}" onerror="this.src='img/noimage.jpg'">
                <a href="detail.html?id=${this.id}"><h3>${this.name}</h3></a>
                <p class="price-text">Giá: ${priceFormatted} đ</p>
                <button class="detail-button" onclick="window.location.href='detail.html?id=${this.id}'">
                    Xem chi tiết
                </button>
            </div>
        `;
    }

    renderDetail() {
        return `
            <div class="product-detail">
                <div class="product-detail-image">
                    <img src='${this.image}' alt='${this.name}' onerror="this.onerror=null;this.src='img/apple2.jpg';" />
                </div>
                <div class="product-detail-info">
                    <h1 class="product-detail-title">${this.name}</h1>
                    <p class="product-detail-price">${Number(this.price).toLocaleString()}₫</p>
                    <p class="product-detail-desc">${this.description || ''}</p>
                    <button id="addCartBtn" class="btn-add-cart" productId="${this.id}">
                        <i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        `;
    }
}

//Trang chủ hiển thị sản phẩm 
const productHot = document.getElementById('product-hot');
const productLaptop = document.getElementById('product-laptop');
const productDienThoai = document.getElementById('product-dienthoai');
if (productHot) {
    fetch('https://my-json-server.typicode.com/phatletran3321-rgb/fronend//products')
        .then(response => response.json())
        .then(data => {
            const dataHot = data.filter(p => p.hot == true);
            const dataLaptop = data.filter(p => p.category === "laptop");
            const dataPhone = data.filter(p => p.category === "điện thoại");
            renderProduct(dataHot, productHot);
            renderProduct(dataLaptop, productLaptop);
            renderProduct(dataPhone, productDienThoai);
        })
        .catch(err => console.error("Lỗi khi tải sản phẩm:", err));
}

//Show trang sản phẩm
const productAll = document.getElementById('product-list'); 
const searchInput = document.getElementById('search-input');
const sortPrice = document.getElementById('sort-price');
let allProductsData = [];

if (productAll) {
    fetch('https://my-json-server.typicode.com/phatletran3321-rgb/fronend//products')
        .then(response => response.json())
        .then(data => {
            renderProduct(data, productAll);
            allProductsData = data;
        })
        .catch(err => console.error("Lỗi khi tải danh sách sản phẩm:", err));

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filteredProducts = allProductsData.filter(
                p => p.name.toLowerCase().includes(keyword)
            );
            renderProduct(filteredProducts, productAll);
        });
    }

    if (sortPrice) {
        sortPrice.addEventListener('change', (e) => {
            if (e.target.value === "asc") {
                allProductsData.sort((a, b) => a.price - b.price);
            } else if (e.target.value === 'desc') {
                allProductsData.sort((a, b) => b.price - a.price);
            }
            renderProduct(allProductsData, productAll);
        });
    }
}

//Hàm render danh sách
const renderProduct = (array, theDiv) => {
    if (!theDiv) return;
    let html = "";
    array.forEach((item) => {
        const product = new Product(
            item.id,
            item.name,
            item.price,
            item.image,
            item.category,
            item.hot,
            item.description
        );
        html += product.toHTML();
    });
    theDiv.innerHTML = html;
};

//Banner slideshow
const banners = document.querySelectorAll(".banner img");
let current = 0;
function showNextBanner() {
    if (banners.length === 0) return;
    banners[current].classList.remove("active");
    current = (current + 1) % banners.length;
    banners[current].classList.add("active");
}
if (banners.length > 0) {
    banners[current].classList.add("active");
    setInterval(showNextBanner, 3000);
}

//Trang chi tiết
const productDetailDiv = document.getElementById('detail-product');
if (productDetailDiv) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        fetch(`https://my-json-server.typicode.com/phatletran3321-rgb/fronend//products/${id}`)
            .then(response => response.json())
            .then(data => {
                const product = new Product(
                    data.id,
                    data.name,
                    data.price,
                    data.image,
                    data.category,
                    data.hot,
                    data.description
                );
                productDetailDiv.innerHTML = product.renderDetail();
            })
            .catch(err => console.error("Lỗi khi tải chi tiết sản phẩm:", err));
    }
}

//Class cart
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartDisplay();
    }
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
        this.saveCart();
    }
    updateItemQuantity(id, newQuantity) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            if (newQuantity > 0) {
                item.quantity = newQuantity;
            } else {
                this.removeItem(id);
            }
            this.saveCart();
        }
    }
    removeItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.saveCart();
    }
    closeCart() {
        if (confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng không?")) {
            this.items = [];
            this.saveCart();
        }
    }
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartDisplay();
        if (typeof updateCartView === "function") updateCartView();
    }
    updateCartDisplay() {
        const countEl = document.getElementById('cartCount');
        if (countEl) {
            const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
            countEl.textContent = totalQuantity;
        }
    }
    getTotal() {
        return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }
    render() {
        if (this.items.length === 0) return "<p>Giỏ hàng trống!</p>";
        let html = `
            <h3>Giỏ hàng</h3>
            <table>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                </tr>
        `;
        this.items.forEach(item => {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${(item.price * item.quantity).toLocaleString('vi-VN')} đ</td>
                </tr>
            `;
        });
        html += '</table>';
        return html;
    }
}

// Tạo giỏ hàng
const cart = new Cart();
const cartCount = document.getElementById('cartCount');
if (cartCount) {
    const totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cartCount.textContent = totalQuantity;
}

document.addEventListener('click', function (e) {
    const addBtn = e.target.closest('#addCartBtn');
    if (addBtn) {
        const productId = addBtn.getAttribute('productId');
       let quantity = 1;
        fetch(`https://my-json-server.typicode.com/phatletran3321-rgb/fronend//products/${productId}`)
            .then(response => response.json())
            .then(item => {
                const product = new Product(
                    item.id,
                    item.name,
                    item.price,
                    item.image,
                    item.category,
                    item.hot,
                    item.description
                );
                cart.addItem(product, quantity);
                const totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
                const cartCount = document.getElementById('cartCount');
                if (cartCount) {
                    cartCount.textContent = totalQuantity;
                }
                alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
            })
            .catch(error => console.error("Lỗi khi tải sản phẩm:", error));
    }
});

// Tạo header
const header = document.createElement('header');
header.innerHTML = `
  <div class="logo">
    <img src="img/logo.jpg" alt="Logo">
    TranPhat Store
  </div>
  <div class="search">
    <input type="text" id="search-input" placeholder="Tìm kiếm sản phẩm">
  </div>
  <div class="menu">
    <a href="index.html">Trang chủ</a>
    <a href="product.html">Sản phẩm</a>
    <a href="about.html">Giới thiệu</a>
    <a href="contact.html">Liên hệ</a>
    <a href="#"><i class="fa-solid fa-user"></i></a>
    <div class="cart" id="cartIcon">
      🛒 <span id="cartCount"></span>
    </div>
    <div class="location">Long An</div>
  </div>
`;
document.body.prepend(header);

// Tạo giỏ hàng popup
const cartBox = document.createElement('div');
cartBox.id = 'cartBox';
cartBox.innerHTML = `
  <div class="cart-popup">
    <div class="cart-header">
      <h3>🛒 Giỏ hàng</h3>
      <button id="closeCart">✖</button>
    </div>
    <div id="cartContent"></div>
    <div class="cart-footer">
      <p><b>Tổng cộng:</b> <span id="cartTotal">0</span> đ</p>
    </div>
  </div>
`;
document.body.appendChild(cartBox);

// Hàm cập nhật nội dung giỏ hàng
// Hàm cập nhật nội dung giỏ hàng (ĐÃ SỬA)
function updateCartView() {
  const cartContent = document.getElementById('cartContent');
  const cartTotal = document.getElementById('cartTotal');

  if (cart.items.length === 0) {
    cartContent.innerHTML = '<p>Giỏ hàng trống!</p>';
    cartTotal.textContent = '0';
    return;
  }

  let html = `<table>
    <tr><th>Sản phẩm</th><th>SL</th><th>Giá</th><th></th></tr>`;

  cart.items.forEach((item, index) => {
    // Ép kiểu giá về dạng số (bỏ dấu chấm hoặc ký tự khác)
    const price = parseInt(String(item.price).replace(/\D/g, "")) || 0;
    const totalItem = price * item.quantity;

    html += `
      <tr>
        <td>${item.name}</td>
        <td>
          <button class="qty" data-action="minus" data-index="${index}">-</button>
          ${item.quantity}
          <button class="qty" data-action="plus" data-index="${index}">+</button>
        </td>
        <td>${totalItem.toLocaleString('vi-VN')} đ</td>
        <td><button class="remove" data-index="${index}">X</button></td>
      </tr>`;
  });

  html += '</table>';
  cartContent.innerHTML = html;

  // Tính tổng tiền giỏ hàng
  const total = cart.items.reduce((sum, item) => {
    const price = parseInt(String(item.price).replace(/\D/g, "")) || 0;
    return sum + price * item.quantity;
  }, 0);

  cartTotal.textContent = total.toLocaleString('vi-VN');

  // Gắn lại sự kiện cho nút +, -, X
  document.querySelectorAll('.qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const action = e.target.dataset.action;
      const item = cart.items[index];

      if (action === "plus") item.quantity++;
      if (action === "minus") item.quantity--;
      if (item.quantity <= 0) cart.items.splice(index, 1);

      cart.saveCart();
      updateCartView();
    });
  });

  document.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      cart.items.splice(index, 1);
      cart.saveCart();
      updateCartView();
    });
  });
}

// Mở/đóng giỏ hàng
const cartIcon = document.getElementById('cartIcon');
if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        cartBox.classList.toggle('show');
        updateCartView();
    });
}
const closeCartBtn = document.getElementById('closeCart');
if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
        cartBox.classList.remove('show');
    });
}

// Footer
const footer = document.createElement('footer');
footer.innerHTML=`
 <div class="footer-container">
      <div class="footer-column">
        <h4>Tổng đài hỗ trợ</h4>
        <p>Gọi mua: <a href="tel:1900232460">1900 232 460</a> (8:00 - 21:30)</p>
        <p>Khiếu nại: <a href="tel:18001062">1800 1062</a> (8:00 - 21:30)</p>
        <p>Bảo hành: <a href="tel:1900232464">1900 232 464</a> (8:00 - 21:00)</p>
      </div>

      <div class="footer-column">
        <h4>Về công ty</h4>
        <ul>
          <li><a href="#">Giới thiệu công ty</a></li>
          <li><a href="#">Tuyển dụng</a></li>
          <li><a href="#">Gửi góp ý, khiếu nại</a></li>
          <li><a href="#">Tìm siêu thị (2.963 shop)</a></li>
        </ul>
      </div>

      <div class="footer-column">
        <h4>Thông tin khác</h4>
        <ul>
          <li><a href="#">Tích điểm Quà tặng VIP</a></li>
          <li><a href="#">Lịch sử mua hàng</a></li>
          <li><a href="#">Bán hàng CTV chiết khấu cao</a></li>
          <li><a href="#">Mua trả góp</a></li>
          <li><a href="#">Chính sách bảo hành</a></li>
        </ul>
      </div>

      <div class="footer-column">
        <h4>Website cùng tập đoàn</h4>
        <div class="brands">
          <img src="img/topzone.jpg" alt="Topzone">
          <img src="img/dienmayxanh.jpg" alt="Điện máy Xanh">
          <img src="img/bachhoaxanh.jpg" alt="Bách Hóa Xanh">
          <img src="img/nhakhoa.jpg" alt="An Khang">
        </div>
        <div class="social">
          <a href="#">❤️ 875k Đăng ký</a> | 
          <a href="#">💬 Zalo Trần Phát</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2025 Tran Phat Store. Địa chỉ: Long An. Email: support@tranphatstore.com</p>
    </div>`;
document.body.appendChild(footer);

document.addEventListener("DOMContentLoaded", () => {
    const cart = new Cart();
    cart.updateCartDisplay();
});
