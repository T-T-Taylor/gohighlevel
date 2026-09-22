<script>
document.addEventListener("hydrationDone", function () {

  function setUnitedStates() {
    const countrySelects = document.querySelectorAll(
      'select[name="country"], select[name*="country"], select[id*="country"]'
    );

    countrySelects.forEach(function(select) {
      const currentText =
        select.options[select.selectedIndex]?.text?.trim().toLowerCase() || "";

      if (
        !select.value ||
        currentText === "afghanistan" ||
        select.value.toLowerCase() === "af"
      ) {
        const usaOption = Array.from(select.options).find(function(option) {
          const text = option.text.trim().toLowerCase();
          const value = option.value.trim().toLowerCase();

          return (
            text === "united states" ||
            text === "united states of america" ||
            value === "us" ||
            value === "usa"
          );
        });

        if (usaOption) {
          select.value = usaOption.value;

          select.dispatchEvent(new Event("change", { bubbles: true }));
          select.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });
  }

  // Run immediately after GHL finishes loading
  setUnitedStates();

  // GHL can render the order form a moment later, so check again
  setTimeout(setUnitedStates, 500);
  setTimeout(setUnitedStates, 1500);
  setTimeout(setUnitedStates, 3000);
});
</script>
