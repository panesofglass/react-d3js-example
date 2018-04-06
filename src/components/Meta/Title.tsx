import * as React from 'react';
import { scaleLinear } from 'd3-scale';
import { mean as d3mean, extent as d3extent } from 'd3-array';

import { Filters, Salary } from '../../DataHandling';
import USStatesMap from './USStatesMap';

interface Props {
    data: Salary[];
    filteredBy: Filters;
}

class Title extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }

    get yearsFragment() {
        const year = this.props.filteredBy.year;

        return year === '*' ? '' : `in ${year}`;
    }

    get USstateFragment() {
        const USstate = this.props.filteredBy.USstate;

        return USstate === '*' ? '' : USStatesMap[USstate.toUpperCase()];
    }

    get jobTitleFragment() {
        const { jobTitle, year } = this.props.filteredBy;
        let title = '';

        if (jobTitle === '*') {
            if (year === '*') {
                title = 'The average H1B in tech pays';
            } else {
                title = 'The average tech H1B paid';
            }
        } else {
            if (jobTitle === '*') {
                // This should never execute.
                title = 'H1Bs in tech pay';
            } else {
                title = `Software ${jobTitle}s on an H1B`;

                if (year === '*') {
                    title += ' make';
                } else {
                    title += 'made';
                }
            }
        }

        return title;
    }

    get format() {
        return scaleLinear()
                .domain(d3extent(this.props.data, d => d.base_salary) as [number, number])
                .tickFormat();
    }

    render() {
        const mean = this.format(d3mean(this.props.data, d => d.base_salary) as number);

        let title: JSX.Element;
        if (this.yearsFragment && this.USstateFragment) {
            title = (
                <h2>
                    In {this.USstateFragment}, {this.jobTitleFragment}
                    ${mean}/year {this.yearsFragment}
                </h2>
            );
        } else {
            title = (
                <h2>
                    {this.jobTitleFragment} ${mean}/year
                    {this.USstateFragment ? `in ${this.USstateFragment}` : ''}
                    {this.yearsFragment}
                </h2>
            );
        }

        return title;
    }
}

export default Title;