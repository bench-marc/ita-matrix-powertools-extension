<template>
  <div>
    <table style="float:left; margin-right:15px; margin-top:15px;">
      <tbody>
        <tr>
          <td colspan="3" style="text-align:center;">Price breakdown:</td>
        </tr>
        <tr>
          <td>{{ cur }} per mile</td>
          <td colspan="2" style="text-align:right;">{{ (price / currentItin['dist']).toFixed(4) }}</td>
        </tr>
        <tr>
          <td>Basefare</td>
          <td style="padding:0px 3px;text-align:right;">{{ (basefare / price) | percent }}</td>
          <td style="text-align:right;">{{ cur }}{{ basefare | currency }}</td>
        </tr>
        <tr>
          <td>Tax</td>
          <td style="padding:0px 3px;text-align:right;">{{ (taxes / price) | percent }}</td>
          <td style="text-align:right;">{{ cur }}{{ taxes | currency }}</td>
        </tr>
        <tr>
          <td>Surcharges</td>
          <td style="padding:0px 3px;text-align:right;">{{ (surcharge / price) | percent }}</td>
          <td style="text-align:right;">{{ cur }}{{ surcharge | currency }}</td>
        </tr>
        <tr>
          <td style="border-top: 1px solid #878787;padding:2px 0">Bf+Tax</td>
          <td style="border-top: 1px solid #878787;padding:2px 3px;text-align:right;">{{ ((taxes + basefare) / price) | percent }}</td>
          <td style="border-top: 1px solid #878787;padding:2px 0; text-align:right;">{{ cur }}{{ (taxes + basefare) | currency }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  created: function() {
    this.calculateBreakdown();
  },
  filters: {
    percent(val) {
      return (val * 100).toFixed(1) + '%';
    },
    currency(val) {
      return val.toFixed(2);
    },
  },
  watch: {
    currentItin: {
      handler: function() {
        this.calculateBreakdown();
      },
      deep: true,
    },
  },
  methods: {
    calculateBreakdown() {
      const items = document.querySelectorAll('.KIR33AB-v-c div.KIR33AB-k-m tr td[align="left"] td[align="left"] tr');
      let basefare = 0;
      let taxes = 0;
      let surcharge = 0;
      let cur;
      items.forEach(item => {
        const descriptionElement = item.querySelector('.KIR33AB-k-g');
        const valueElement = item.querySelector('.KIR33AB-k-f');
        if (descriptionElement && valueElement) {
          if (!cur) {
            cur = valueElement.textContent.replace(/[\d,.]/g, '');
          }
          let description = descriptionElement.textContent;
          let value = parseInt(valueElement.textContent.replace(/[^\d]/gi, ''));
          if (description.startsWith('Fare ')) {
            basefare += value;
          } else if (new RegExp('((YQ|YR))').test(description)) {
            surcharge += value;
          } else if (description.includes('(')) {
            taxes += value;
          }
        }
      });
      this.basefare = basefare / 100;
      this.taxes = taxes / 100;
      this.surcharge = surcharge / 100;
      this.price = (basefare + taxes + surcharge) / 100;
      this.cur = cur;
    },
  },
};
</script>

<style lang="scss"></style>
