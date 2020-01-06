<template>
  <div id="powertoolslinkcontainer">
    <div id="mode" v-if="showModeSelect">
      <h3>Generation mode</h3>
      <input id="legbased" type="radio" v-model="mode" value="leg">
      <label for="legbased">leg-based</label>
      <input id="segmentbased" type="radio" v-model="mode" value="segment">
      <label for="segmentbased">segment-based</label>
    </div>
    <hr>
    <div class="agency">
      <a :href="aaUrl" target="_blank">American Airlines</a>
    </div>
    <div class="agency">
      <url-container name="Air Canada" :urls="acUrls"></url-container>
    </div>
    <div class="agency">
      <url-container name="Air France" :urls="afUrls"></url-container>
    </div>
    <div class="agency">
      <url-container name="Delta" :urls="deltaUrls"></url-container>
    </div>
    <div v-if="showOneWorld" class="agency">
      <url-container v-if="showOneWorld" name="Iberia" :urls="ibUrls"></url-container>
    </div>
    <div v-if="showLh" class="agency">
      <url-container v-if="showLh" name="Lufthansa" :urls="lhUrls"></url-container>
    </div>
    <div v-if="showLx" class="agency">
      <url-container name="Swiss" :urls="lxUrls"></url-container>
    </div>
    <div class="agency">
      <url-container name="KLM" :urls="klUrls"></url-container>
    </div>
    <hr>
    <div class="agency">
      <url-container name="Expedia" :urls="expediaUrls"></url-container>
    </div>
    <div class="agency">
      <a :href="pricelineUrl" target="_blank">Priceline</a><br>
    </div>
    <div class="agency">
      <a :href="cheapOairUrl" target="_blank">CheapOair</a><br>
    </div>
    <div v-if="lastminuteUrl" class="agency">
      <a :href="lastminuteUrl" target="_blank">Lastminute.de</a><br>
    </div>
    <hr>
    <div class="agency">
      <a :href="hipmunkUrl" target="_blank">Hipmunk</a><br>
    </div>
    <div class="agency">
      <url-container name="Momondo" :urls="momondoUrls"></url-container>
    </div>
    <div class="agency">
      <url-container name="Kayak" :urls="kayakUrls"></url-container>
    </div>
    <div class="agency">
      <url-container name="Skyscanner" :urls="skyscannerUrls"></url-container>
    </div>
    <div class="agency">
      <a :href="googleUrl" target="_blank">Google Flights</a><br>
    </div>
    <hr>
    <div class="agency">
      <a :href="gcmUrl" target="_blank">GCM</a>
    </div>
    <div class="agency">
      <where-to-credit :currentItin="currentItin"></where-to-credit>
    </div>
  </div>
</template>

<script>
import { getPricelineUrl } from "../urlBuilders/priceline";
import { getCheapOairUrl } from "../urlBuilders/cheapOair";
import { getExpediaUrl, exEditions } from "../urlBuilders/expedia";
import { getMomondoUrl, momondoEditions } from "../urlBuilders/momondo";
import { getLastminuteUrl } from "../urlBuilders/lastminute";
import { getKayakUrl, kayakEditions } from "../urlBuilders/kayak";
import { getSkyscannerUrl, skyscannerEditions } from "../urlBuilders/skyscanner";
import { getHipmunkUrl } from "../urlBuilders/hipmunk";
import { getGcmUrl } from "../urlBuilders/gcm";
import { getAAc1Url } from "../urlBuilders/americanAirlines"
import { getDlUrl, dlEditions } from "../urlBuilders/delta"
import { getAcUrl, acEditions } from "../urlBuilders/airCanada"
import { getAfUrl, afEditions } from "../urlBuilders/airFrance"
import { getIbUrl, ibEditions } from "../urlBuilders/iberia"
import { getLhUrl, lhEditions } from "../urlBuilders/lufthansa"
import { getLxUrl, lxEditions } from "../urlBuilders/swiss"
import { getKlUrl, klEditions } from "../urlBuilders/klm"
import { getGoogleUrl } from "../urlBuilders/google";
import UrlContainer from './UrlContainer.vue'
import WhereToCredit from './WhereToCredit.vue'

export default {
  components: {
    UrlContainer,
    WhereToCredit
  },
  computed: {
    currentItinSingle: function() {
      let itinSingle = []
      this.originalItin.itin.forEach(l => {
        l.seg.forEach(s => {
          itinSingle.push({
            arr: s.arr,
            dep: s.dep,
            dest: s.dest,
            orig: s.orig,
            seg: [s]
          })
        })
      })
      return {
        carriers: this.originalItin.carriers,
        cur: this.originalItin.cur,
        dist: this.originalItin.dist,
        itin: itinSingle,
        numPax: this.originalItin.numPax,
        pax: this.originalItin.pax,
        price: this.originalItin.price,
        requestedCabin: this.originalItin.requestedCabin
      }
    },
    currentItin: function() {
      if (this.mode == 'leg') {
        return this.originalItin
      } else {
        return this.currentItinSingle
      }
    },
    showModeSelect: function() {
      return this.originalItin.itin.length != this.currentItinSingle.itin.length
    },
    showOneWorld: function() {
      return this.currentItin.carriers.includes('IB') || this.currentItin.carriers.includes('BA')
    },
    showLh: function() {
      return this.currentItin.carriers.includes('LH') || this.currentItin.carriers.includes('OS')
    },
    showLx: function() {
      return this.currentItin.carriers.includes('LX')
    },
    aaUrl: function() {
      return getAAc1Url(this.currentItin)
    },
    acUrls: function() {
      return acEditions.map(e => {
        return { text: e.name, url: getAcUrl(this.currentItin, e.value) };
      })
    },
    afUrls: function() {
      return afEditions.map(e => {
        return { text: e.name, url: getAfUrl(this.currentItin, e.value) };
      })
    },
    ibUrls: function() {
      return ibEditions.map(e => {
        return { text: e.name, url: getIbUrl(this.currentItin, e.value) };
      })
    },
    deltaUrls: function() {
      return dlEditions.map(e => {
        return { text: e.name, url: getDlUrl(this.currentItin, e.value) };
      })
    },
    lhUrls: function() {
      return lhEditions.map(e => {
        return { text: e.name, url: getLhUrl(this.currentItin, e.value) };
      })
    },
    lxUrls: function() {
      return lxEditions.map(e => {
        return { text: e.name, url: getLxUrl(this.currentItin, e.value) };
      })
    },
    klUrls: function() {
      return klEditions.map(e => {
        return { text: e.name, url: getKlUrl(this.currentItin, e) };
      })
    },
    pricelineUrl: function() {
      return getPricelineUrl(this.currentItin)
    },
    cheapOairUrl: function() {
      return getCheapOairUrl(this.currentItin)
    },
    expediaUrls: function() {
      return exEditions.map(e => {
        return { text: e.name, url: getExpediaUrl(this.currentItin, e.host) };
      })
    },
    hipmunkUrl: function() {
      return getHipmunkUrl(this.currentItin)
    },
    momondoUrls: function() {
      return momondoEditions.map(e => {
        return { text: e.name, url: getMomondoUrl(this.currentItin, e.host) };
      })
    },
    kayakUrls: function() {
      return kayakEditions.map(e => {
        return { text: e.name, url: getKayakUrl(this.currentItin, e.host) };
      })
    },
    skyscannerUrls: function() {
      return skyscannerEditions.map(e => {
        return { text: e.name, url: getSkyscannerUrl(this.currentItin, e.host) };
      })
    },
    lastminuteUrl: function() {
      return getLastminuteUrl(this.currentItin);
    },
    googleUrl: function() {
      return getGoogleUrl(this.currentItin);
    },
    gcmUrl: function() {
      return getGcmUrl(this.currentItin);
    }
  }
};
</script>

<style lang="scss" scoped>
#powertoolslinkcontainer {
  margin:15px 0px 0px 10px
}
a {
  margin: 5px 0px 10px 0px;
  font-size:100%;
  font-weight:600;
}
.agency {
  margin: 5px 0px 10px 0px
}
input {
  vertical-align: middle;
}
#mode {
  line-height: 20px;
}
</style>
