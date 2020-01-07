import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addSymbols } from '../actions/searchActions';



class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: '',
            currentSymbolsList: []
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillMount() {
        // this.props.getTwitsList();
    }

    onChange(e) {
        this.setState({ searchQuery: e.target.value });
    }

    onSubmit(e) {
        e.preventDefault();
        const symbols = this.state.searchQuery.split(',').map(s => s.toUpperCase().trim());
        symbols.forEach(symbol => {
            this.props.addSymbols(symbol);
        })
        this.setState({searchQuery: ''});
    }

    render() {
        console.log(this.props.list);
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

const mapStateToProps = state => ({
    list: state.search.list
})

export default connect(null, { addSymbols })(SearchForm);