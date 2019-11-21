<template>
  <div v-if="miles.length">
    <a href="https://www.wheretocredit.com" target="_blank">Data provided by wheretocredit.com</a>
    <ul>
      <li v-for="item in miles">
        {{item.value}} {{item.name}}
      </li>
    </ul>
  </div>
  <div v-else>
    <a href="#" @click.prevent="queryMiles()">Calculate miles with wheretocredit.com</a>
  </div>

  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'whereToCredit',
  props: {
    currentItin: Object
  },
  data() {
    return {
      miles: false
    };
  },
  methods: {
  	queryMiles() {
    	console.log('query API')
      let itin = {
        ticketingCarrier: this.currentItin.carriers.length == 1 ? this.currentItin.carriers[0] : null,
        baseFareUSD: this.currentItin.basefares + this.currentItin.surcharges,
        segments: []
      };
      for (var i = 0; i < this.currentItin.itin.length; i++) {
        for (var j = 0; j < this.currentItin.itin[i].seg.length; j++) {
          itin.segments.push({
            origin: this.currentItin.itin[i].seg[j].orig,
            destination: this.currentItin.itin[i].seg[j].dest,
            departure: new Date(this.currentItin.itin[i].seg[j].dep.year, this.currentItin.itin[i].seg[j].dep.month, this.currentItin.itin[i].seg[j].dep.day),
            carrier: this.currentItin.itin[i].seg[j].carrier,
            bookingClass: this.currentItin.itin[i].seg[j].bookingclass,
            codeshare: this.currentItin.itin[i].seg[j].codeshare,
            flightNumber: this.currentItin.itin[i].seg[j].fnr,
          });
        }
      }
      axios.post('https://www.wheretocredit.com/api/beta/calculate', [itin]).then(response => {
        this.miles = response.data.value[0].value.totals.sort(function (a, b) {
          if (a.value === b.value) {
            return +(a.name > b.name) || +(a.name === b.name) - 1;
          }
          return b.value - a.value; // desc
        });
      })
    }
  },
  watch: {
    currentItin: {
      handler: function () {
        this.miles = false;
      },
      deep: true
    }
  },
};
</script>

<style lang="scss">

</style>
