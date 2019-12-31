import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addSymbols } from '../actions/searchActions';



class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: ''
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange(e) {
        this.setState({ searchQuery: e.target.value });
    }

    onSubmit(e) {
        e.preventDefault();
        const symbols = this.state.searchQuery;

        this.props.addSymbols(symbols);
        
    }

    render() {
        return (
        <>
        <div className="search-box">
            <div className="search-form">
                <form onSubmit={this.onSubmit}>
                    <input type="text" name="searchQuery" onChange={this.onChange} value={this.state.searchQuery} />
                    <button type="submit">Search</button>
                </form>
            </div>
        </div>
        </>
    )
    
    }
};

export default connect(null, { addSymbols })(SearchForm);