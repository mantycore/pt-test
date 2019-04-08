import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  selectedCart = [
    { price: 20 },
    { price: 45 },
    { price: 67 },
    { price: 1305 }
  ];
  selectedCartJSON = JSON.stringify(this.selectedCart);
  error = null;
  totalCartPriceJSON = "";

  onCartInput(value: string) {
    if (value === this.selectedCartJSON) { return; }
    this.selectedCartJSON = value;
    try {
      this.selectedCart = JSON.parse(value);
      this.error = null;
      this.totalCartPriceJSON = "[ waiting for currency data ]";
      this.process();
    } catch(e) {
      this.error = "Input is not a valid JSON";
    }
  }

  process() {
    function pluck(arr, prop) {
        return arr.map(el => el[prop]);
    }

    function sum(arr) {
        return arr.reduce((acc, cur) => acc + cur, 0);
    }

    function reduceToObject(arr, fun) {
        return arr.reduce((acc, cur) => {
            acc[cur] = fun(cur);
            return acc;
        }, {});
    }

    const symbolsToPairs = {
        rubles: 'USD_RUB',
        euros: 'USD_EUR',
        pounds: 'USD_GBP',
        yens: 'USD_JPY'
    };

    const sumUSD = sum(pluck(this.selectedCart, 'price'));

    fetch("https://free.currencyconverterapi.com/api/v6/convert?q=USD_RUB,USD_EUR,USD_GBP,USD_JPY&compact=ultra&apiKey=c0ddd85505d82b4f8d06"
    )
        .then(res => res.json())
        .then(pairs => Object.assign({
                "US dollars": sumUSD
            }, reduceToObject(
                Object.keys(symbolsToPairs),
                cur => pairs[symbolsToPairs[cur]] * sumUSD
            )
        ))
        .then(result => { this.totalCartPriceJSON = JSON.stringify(result); });
  }
}
