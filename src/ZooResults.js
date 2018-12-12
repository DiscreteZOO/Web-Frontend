import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import ReactTable from "react-table";
import ChooseColumns from './ZooColumns';
/* DATA */
import objectProperties from './objectProperties.json';
import defaults from './defaults.json';

const camelToUnderscore = (s) => { 
    return s.replace(/\.?([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, ""); 
}

class ZooResults extends Component {
    
    constructor(props) {
        super(props);
        
        const getColumns = (colNames = []) => {
            const list = (colNames.length == 0 ? defaults.columns[this.props.objects] : colNames);
            const colObjects = list.map((columnName) => {
                var c = objectProperties[this.props.objects][columnName];
                var obj = {
                    Header: c.display,
                    accessor: columnName
                };
                return obj;  
            })
            return colObjects;
        }
        
        this.state = {
            columnKeys: defaults.columns[this.props.objects],
            columns: getColumns(),
            data: null,
            pages: null,
            loading: false,
        };
        
        this.fetchData = this.fetchData.bind(this);
    }
    
    componentDidMount() {
        this.fetchData();
    }
    
    componentDidUpdate(pp, ps) {
        // ok to just compare strings, the objects are sorted and numeric comparisons standardized
        if (this.props.objects !== pp.objects || this.props.parameters !== pp.parameters) {
            this.fetchData();
        }
    }
    
    fetchData(state, instance) {
        this.setState({ loading: true });
        var queryJSON = {
            pageSize: 20,
            page: 1,
            parameters: JSON.parse(this.props.parameters),
            orderBy: []
        }
        const flattenData = (row) => {
            var obj = { zooid: row.zooid };
            Object.keys(row.index).forEach(function(key) { obj[camelToUnderscore(key)] = row.index[key]; });
            Object.keys(row.bool).forEach(function(key) { obj[camelToUnderscore(key)] = String(row.bool[key]); });
            Object.keys(row.numeric).forEach(function(key) { obj[camelToUnderscore(key)] = row.numeric[key]; });
            return obj;
        }
        const toApiOrder = (sort) => {
            return { name: sort.id, value: (sort.desc ? "DESC" : "ASC") };
        }
        if (typeof state !== 'undefined') {
            queryJSON.pageSize = state.pageSize;
            queryJSON.page = state.page + 1;
            queryJSON.orderBy = state.sorted.map(toApiOrder);
        }
        console.log(queryJSON);
        this.props.postData('/results/' + this.props.objects, queryJSON).then(data => {
            console.log(data);
            this.setState({
                data: data.map(flattenData), 
                pages: Math.ceil(this.props.counter/queryJSON.pageSize),
                loading: false
            });
        }).catch(error => console.error(error));
    }
    
    render() {
        const { data, pages, loading } = this.state;
        return (
            <section id="results">
                <Container>
                    <Row>
                        <Col lg="12">
                            <div>
                                <ChooseColumns objects={this.props.objects} current={this.state.columnKeys} />
                            </div>
                            <div className="table-responsive">
                                {this.state.data !== null &&
                                    <ReactTable manual
                                        data={this.state.data} 
                                        columns={this.state.columns}
                                        defaultPageSize={20}
                                        pages={this.state.pages}
                                        onFetchData={this.fetchData}
                                        loading={this.state.loading} // Display the loading overlay when we need it
                                    />
                                }
                            </div>
                       </Col>
                    </Row>
                </Container>
            </section>
        );
    }
}



export default ZooResults;