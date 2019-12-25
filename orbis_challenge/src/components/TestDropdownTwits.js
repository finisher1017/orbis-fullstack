import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getTwits } from '../actions/searchActions';
import { deleteSymbol } from '../actions/searchActions';

class TestDropdownTwits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showList: false,
            dropdownClass: 'dropdown-content',
            toShow: '',
            toDelete: '',

        }
        this.onSubmit = this.onSubmit.bind(this);
        this.toggleList = this.toggleList.bind(this);
    }
    componentWillMount() {
        this.props.getTwits();
        
    }

    onSubmit(e) {
        e.preventDefault();

        this.props.deleteSymbol(e.target.value);
    }

    toggleList(e) {
        if (this.state.showList && this.state.toShow !== e.target.id) {
            this.setState({showList: true, toShow: e.target.id});
        } else {
            this.setState({showList: !this.state.showList, toShow: e.target.id})
        }
        
        // e.preventDefault();
        // console.log(e.target.id);
        // if (this.state.listOpen && this.state.toShow !== e.target.id) {
        //     this.setState({toShow: e.target.id})
        // } else {
        //     this.setState({
        //         toShow: e.target.id,
        //         listOpen: !this.state.listOpen
        //     })
        // }
        
        // this.setState(prevState => ({
        //     toShow: e.target.id,
        //     listOpen: !prevState.listOpen
        // })) 
    }
    render() {
        const {showList, toShow} = this.state;
        console.log(`listOpen: ${showList}`);
        console.log(`toShow: ${toShow}`);
        const symbolList = this.props.search.map(symbol => (
            <div key={symbol._id} className="dropdown">
                <button id={symbol.symbol} onClick={this.toggleList} className="dropbtn">{symbol.twits.length} {symbol.symbol} Twits</button>
                <div className={`${showList && toShow == symbol.symbol ? "" : "dropdown-content"}`}>
                    {symbol.twits.map(twit => (
                        <li key={twit.id}>
                            <h3>Posted by {twit.username} on {twit.stocktwits_timestamp}</h3>
                            <p>{twit.body}</p>
                        </li>
                    ))}
                </div>
            </div>
            // <section key={symbol._id} id={symbol.symbol} className="dd-wrapper">
            //     <a href={"#" + symbol.symbol} className="dd-header" onClick={this.toggleTwits}>
            //         <div id={symbol._id}>{symbol.twits.length} {symbol.symbol} Twits - {symbol._id}</div>
            //     </a>
            //     {this.state.listOpen && this.state.toShow === symbol._id && <ul className="dd-list">
            //         {symbol.twits.map((twit) => (
            //             // <li className="dd-list-item" key={twit.id}>{twit.username}</li>
            //             <li key={twit.id} classsName="dd-list-item">
            //                 <h3>Posted by {twit.username} - {twit.stocktwits_timestamp}</h3>
            //                 <p>{twit.body}</p>
            //             </li>
            //         ))}
            //         </ul>}
            // </section>
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