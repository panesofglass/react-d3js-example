import * as d3 from 'd3';
import * as _ from 'lodash';
import * as topojson from 'topojson';

export interface Filters {
    USstate: string;
    year: string;
    jobTitle: string;
}

export const INIT_FILTERS: Filters = {
    USstate: '*',
    year: '*',
    jobTitle: '*'
};

export interface Income {
    countyName: string;
    USstate: string;
    medianIncome: number;
    lowerBound: number;
    upperBound: number;
}

const cleanIncomes = (d: any): Income => ({
    countyName: d['Name'],
    USstate: d['State'],
    medianIncome: Number(d['Median Household Income']),
    lowerBound: Number(d['90% CI Lower Bound']),
    upperBound: Number(d['90% CI Upper Bound'])
});

const dateParse = d3.timeParse('%m/%d/%Y');

export interface Salary {
    employer: string;
    submit_date: Date | null;
    start_date: Date | null;
    case_status: string;
    job_title: string;
    clean_job_title: string;
    base_salary: number;
    city: string;
    USstate: string;
    county: string;
    countyID: string;
}
const cleanSalary = (d: any): Salary | null => {
    if (!d['base salary'] || Number(d['base salary']) > 300000) {
        return null;
    }

    return {employer: d.employer,
            submit_date: dateParse(d['submit date']),
            start_date: dateParse(d['start date']),
            case_status: d['case status'],
            job_title: d['job title'],
            clean_job_title: d['job title'],
            base_salary: Number(d['base salary']),
            city: d['city'],
            USstate: d['state'],
            county: d['county'],
            countyID: d['countyID']
    };
};

export interface USStateName {
    code: string;
    id: number;
    name: string;
}

const cleanUSStateName = (d: any): USStateName => ({
    code: d.code,
    id: Number(d.id),
    name: d.name
});

export interface CountyName {
    id: number;
    name: string;
}

export interface Payload {
    usTopoJson: topojson.UsAtlas | null;
    countyNames: CountyName[];
    medianIncomes: _.Dictionary<Income>;
    medianIncomesByCounty: _.Dictionary<Income[]>;
    medianIncomesByUSState: _.Dictionary<Income[]>;
    techSalaries: Salary[];
    USstateNames: USStateName[];
}

export const INIT_PAYLOAD: Payload = {
    usTopoJson: null,
    countyNames: [],
    medianIncomes: {},
    medianIncomesByCounty: {},
    medianIncomesByUSState: {},
    techSalaries: [],
    USstateNames: []
};

export const loadAllData = (callback: (data: Payload) => void = _.noop) => {
    Promise.all([
        d3.json('/data/us.json'),
        d3.csv('/data/us-county-names-normalized.csv'),
        d3.csv('/data/county-median-incomes.csv', cleanIncomes),
        d3.csv('/data/h1bs-2012-2016-shortened.csv', cleanSalary),
        d3.tsv('/data/us-state-names.tsv', cleanUSStateName)
    ]).then(([us, countyNamesDsv, medianIncomes, techSalaries, USstateNames]) => {
        let countyNames: CountyName[] =
            countyNamesDsv.map(({ id, name }) => ({id: Number(id),
                                                   name: name || ''}));

        let medianIncomesMap: _.Dictionary<Income> = {};

        medianIncomes.filter(d => _.find(countyNames,
                                         {name: d['countyName']}))
                     .forEach(d => {
                         let county = _.find(countyNames, {name: d['countyName']});
                         if (county !== undefined) {
                            d['countyID'] = county.id;
                            medianIncomesMap[d['countyID']] = d;
                         }
                     });

        callback({
            usTopoJson: us as topojson.UsAtlas,
            countyNames,
            medianIncomes: medianIncomesMap,
            medianIncomesByCounty: _.groupBy(medianIncomes, 'countyName'),
            medianIncomesByUSState: _.groupBy(medianIncomes, 'USstate'),
            techSalaries: techSalaries.filter(d => !_.isNull(d)),
            USstateNames
        });
      });
};