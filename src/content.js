import Vue from 'vue';
import Agencies from './components/Agencies';
import Price from './components/Price';
import UrlContainer from './components/UrlContainer';
import store from './store';
import { getCurrentItin } from "./services/itinDataReader";
import { mptUsersettings } from "./constants";

let currentItin;
let started = false;
const priceData = {}
const agencyData = { mode: 'leg'}
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // check if elements are present
    if (window.location.href.indexOf("view-details") > 0 && document.getElementsByClassName("IR6M2QD-v-e").length && document.getElementsByClassName("IR6M2QD-x-a").length && document.getElementsByClassName("IR6M2QD-v-c").length) {

      // change class IR6M2QD-v-d in order to prevent old script from starting
      if (document.getElementsByClassName("IR6M2QD-v-d").length) {
        document.getElementsByClassName("IR6M2QD-v-d")[0].classList.remove('IR6M2QD-v-d')
      }

      setTimeout(() => {
        const contentHtml = document.getElementById("contentwrapper").innerHTML;
        currentItin = getCurrentItin(contentHtml, mptUsersettings);
        if (!currentItin || JSON.stringify(priceData.currentItin) === JSON.stringify(currentItin)) {
          return;
        }
        priceData.currentItin = currentItin;
        agencyData.originalItin = currentItin;
        console.log(currentItin);

        if (!started) {
          started = true;
          const child = document.querySelectorAll('td.IR6M2QD-v-c')[2]
          const anchor = document.createElement('div')
          child.parentNode.insertBefore(anchor, child.nextSibling)

          const AgencyComponent = Vue.extend(Agencies)
          const agencies = new AgencyComponent({
            data() {
              return agencyData;
            }
          });
          agencies.$mount();
          anchor.appendChild(agencies.$el)

          const priceElement = document.querySelector('tr.IR6M2QD-x-e')
          const priceAnchor = document.createElement('div')
          priceElement.parentNode.insertBefore(priceAnchor, priceElement.nextSibling)

          const PriceComponent = Vue.extend(Price)
          const price = new PriceComponent({
            data() {
              return priceData;
            }
          });
          price.$mount();
          priceAnchor.appendChild(price.$el)
        }
      }, 200)
    }
});

// start observer
observer.observe(document, {
  subtree: true,
  attributes: true
});
