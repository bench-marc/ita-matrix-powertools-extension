import Vue from 'vue';
import Agencies from './components/Agencies.vue';
import Price from './components/Price.vue';
import { getCurrentItin, ICurrentItin } from './services/itinDataReader';
import { mptUsersettings } from './constants';

let currentItin: ICurrentItin | undefined;
let started = false;
const priceData: any = {};
const agencyData: any = { mode: 'leg' };
MutationObserver = window.MutationObserver || (window as any).WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // check if elements are present
    if (window.location.href.indexOf('view-details') > 0 && document.getElementsByClassName('KIR33AB-v-e').length && document.getElementsByClassName('KIR33AB-v-c').length) {
        // change class KIR33AB-v-d in order to prevent old script from starting
        if (document.getElementsByClassName('KIR33AB-v-d').length) {
            document.getElementsByClassName('KIR33AB-v-d')[0].classList.remove('KIR33AB-v-d');
        }

        setTimeout(() => {
            const contentHtml = document.getElementById('contentwrapper')!.innerHTML;
            currentItin = getCurrentItin(contentHtml, mptUsersettings);

            priceData.currentItin = currentItin;
            agencyData.originalItin = currentItin;

            if (!started && currentItin) {
                started = true;
                const elementsTd = document.querySelectorAll('td.KIR33AB-v-c');
                const child = elementsTd[2];
                const anchor = document.createElement('div');
                child.parentNode!.insertBefore(anchor, child.nextSibling);

                const AgencyComponent = Vue.extend(Agencies);
                const agencies = new AgencyComponent({
                    data() {
                        return agencyData;
                    },
                });
                agencies.$mount();
                anchor.appendChild(agencies.$el);

                const priceAnchor = document.createElement('div');
                elementsTd[0].appendChild(priceAnchor);

                const PriceComponent = Vue.extend(Price);
                const price = new PriceComponent({
                    data() {
                        return priceData;
                    },
                });
                price.$mount();
                priceAnchor.appendChild(price.$el);
            }
        }, 200);
    }
});

// start observer
observer.observe(document, {
    subtree: true,
    attributes: true,
});
