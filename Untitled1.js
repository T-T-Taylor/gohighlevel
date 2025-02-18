<script>
function checkQuantitySelector() {
  quantityValue = document.querySelector('[id="quantity-value"]');
  if (quantityValue) {
    let currentValue = parseInt(quantityValue.textContent.trim());

    // Increment button click handler
    document.querySelector('#increment-quantity').addEventListener('click', () => {
      if (parseInt(quantityValue.textContent.trim()) < 10) {
        let newValue = parseInt(quantityValue.textContent.trim()) + 1;
        quantityValue.textContent = newValue.toString();
      }
    });

    // Decrement button click handler
    document.querySelector('#decrement-quantity').addEventListener('click', () => {
      if (parseInt(quantityValue.textContent.trim()) > 0) {
        let newValue = parseInt(quantityValue.textContent.trim()) - 1;
        quantityValue.textContent = newValue.toString();
      }
    });
  } else {
    setTimeout(checkQuantitySelector, 100);
  }
}

checkQuantitySelector();
</script>

<script>
function checkQuantitySelector1() {
  quantityValue = document.querySelector('[id="quantity-value"]');
  if (quantityValue) {
    // Increment button click handler
    document.querySelector('#increment-quantity').addEventListener('click', () => {
      if (parseInt(quantityValue.textContent.trim()) < 11) {
        let newValue = parseInt(quantityValue.textContent.trim());
        quantityValue.textContent = newValue.toString();

        for (let i = 1; i <= 10; i++) {
          const checkbox = document.querySelector(`#div-ctwo-setp-order-6ShqC1Foqa > form > div.bp-container > div:nth-child(${i + 1}) > section > div > div > input`);
          if (newValue === i) {
            checkbox.click();
          } else {
            if (checkbox.checked = true) {
              checkbox.click();
            }
            checkbox.checked = false;
            }
        }
      }
    });

    // Decrement button click handler
    document.querySelector('#decrement-quantity').addEventListener('click', () => {
      if (parseInt(quantityValue.textContent.trim()) >= 0) {
        let newValue = parseInt(quantityValue.textContent.trim());
        quantityValue.textContent = newValue.toString();

        for (let i = 1; i <= 10; i++) {
          const checkbox = document.querySelector(`#div-ctwo-setp-order-6ShqC1Foqa > form > div.bp-container > div:nth-child(${i + 1}) > section > div > div > input`);
          if (newValue === i) {
            checkbox.click();
          } else {
            if (checkbox.checked = true) {
              checkbox.click();
            }
          }
        }
      }
    });
  } else {
    setTimeout(checkQuantitySelector1, 100);
  }
}

checkQuantitySelector1();
</script>
