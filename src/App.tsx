import * as React from 'react';
import * as d3 from 'd3';
import * as _ from 'lodash';

import './App.css';

import Preloader from './components/Preloader';
import { CountyName, Payload, Salary, INIT_DATA, loadAllData } from './DataHandling';

import CountyMap from './components/CountyMap';
import Histogram from './components/Histogram';

export interface State extends Payload {
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = INIT_DATA;
  }

  countyValue(county: CountyName, techSalariesMap: _.Dictionary<Salary[]>) {
    const medianHousehold = this.state.medianIncomes[county.id],
          salaries = techSalariesMap[county.name];

    if (!medianHousehold || !salaries) {
      return null;
    }

    const median = d3.median(salaries, d => d.base_salary) || 0;

    return {
      countyID: county.id,
      value: median - medianHousehold.medianIncome
    };
  }

  componentWillMount() {
    loadAllData((data: Payload) => this.setState(data));
  }

  render() {
    if (this.state.techSalaries.length < 1) {
      return (
        <Preloader />
      );
    }

    const filteredSalaries = this.state.techSalaries,
          filteredSalariesMap = _.groupBy(filteredSalaries, 'countyID'),
          countyValues: {countyID: number; value: number}[] = [];

    this.state.countyNames.forEach(county => {
      const countyValue = this.countyValue(county, filteredSalariesMap);
      if (!_.isNull(countyValue)) {
        countyValues.push(countyValue);
      }
    });

    let zoom: number | null = null;

    return (
      <div className="App container">
        <svg width="1100" height="500">
          <CountyMap
            usTopoJson={this.state.usTopoJson}
            USstateNames={this.state.USstateNames}
            values={countyValues}
            x={0}
            y={0}
            width={500}
            height={500}
            zoom={zoom}
          />
          <Histogram
            bins={10}
            width={500}
            height={500}
            x={500}
            y={10}
            data={filteredSalaries}
            axisMargin={83}
            bottomMargin={5}
            value={d => d.base_salary}
          />
        </svg>
      </div>
    );
  }
}

export default App;
