import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getTwits } from '../actions/searchActions';
import { deleteSymbol } from '../actions/searchActions';

class TestDropdownTwits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listOpen: false,
            toShow: '',
            toDelete: ''
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.toggleTwits = this.toggleTwits.bind(this);
    }
    componentWillMount() {
        this.props.getTwits();
        
    }

    onSubmit(e) {
        e.preventDefault();

        this.props.deleteSymbol(e.target.value);
    }

    toggleTwits(e) {
        e.preventDefault();
        console.log(e.target.id);
        if (this.state.listOpen && this.state.toShow !== e.target.id) {
            this.setState({toShow: e.target.id})
        } else {
            this.setState({
                toShow: e.target.id,
                listOpen: !this.state.listOpen
            })
        }
        
        // this.setState(prevState => ({
        //     toShow: e.target.id,
        //     listOpen: !prevState.listOpen
        // })) 
    }
    render() {
        const symbolList = this.props.search.map(symbol => (
            <section key={symbol._id} id={symbol.symbol} className="dd-wrapper">
                <a href={"#" + symbol.symbol} className="dd-header" onClick={this.toggleTwits}>
                    <div id={symbol._id}>{symbol.twits.length} {symbol.symbol} Twits - {symbol._id}</div>
                </a>
                {this.state.listOpen && this.state.toShow === symbol._id && <div className="dd-list">
                    {symbol.twits.map((twit) => (
                        // <li className="dd-list-item" key={twit.id}>{twit.username}</li>
                        <div key={twit.id} classsName="dd-list-item">
                            <h3>Posted by {twit.username} - {twit.stocktwits_timestamp}</h3>
                            <p>{twit.body}</p>
                        </div>
                    ))}
                    </div>}
            </section>
            // <div key={symbol._id}>
            //     <h3>{symbol.twits.length} {symbol.symbol} Twits</h3>
            //     <button>twits</button>
            //     <button onClick={this.onSubmit} value={symbol.symbol}>delete</button>
            //     {symbol.twits.map(twit => (
            //         <div id="twits" className="dropdown-content" key={twit.id}>
            //             <h4>{twit.username}</h4>
            //             <h4>{twit.stocktwits_timestamp}</h4>
            //             <h4>{twit.body}</h4>
            //         </div>
            //         ))
            //     }
            // </div>
        ));
        return (
            <>
            <h1>Dropdown Test Twits</h1>
            {symbolList}
            </>
        );
    }
};

// Search.propTypes = {
//     getTwits: PropTypes.func.isRequired,
//     search: PropTypes.array.isRequired
// }

const mapStateToProps = state => ({
    search: state.search.symbols
})

export default connect(mapStateToProps, { getTwits, deleteSymbol })(TestDropdownTwits);