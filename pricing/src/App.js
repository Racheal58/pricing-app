import React, { Component } from "react";
import "./index.css";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import Geocoder from "geocoder";
import axios from "axios";

axios.defaults.headers.common["Authorization"] =
  "pk_b8182c4103c5e800c31c4ee37bdeb1fd02d1caa5c50b0f602c14fff20c3a43de";
const GMaps_API_KEY = "AIzaSyAqMa2LcUT95eerS6wM4U9Kzwx3_Lp9gWQ";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originLong: "",
      destinationLong: "",
      originLat: "",
      destinationLat: "",
      origin: "",
      destination: "",
      bounds: {},
      estimate: ""
    };
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  getLongLat = address => {
    // Geocoding
    const promise = new Promise((resolve, reject) => {
      Geocoder.geocode(
        address,
        (err, data) => {
          // do something with data
          if (data && data.status === "OK") {
            const location = data.results[0].geometry.location;
            return resolve(location);
          }
          console.log(err);
          return reject("Error retrieiving long and lat");
        },
        { apiKey: GMaps_API_KEY }
      );
    });

    return promise;
  };

  async getEstimate() {
    const {
      originLong,
      destinationLong,
      originLat,
      destinationLat
    } = this.state;

    const estimate = await axios.post(
      "https://sandbox.max.ng/v1/pricings/estimate",
      {
        origin: {
          lat: originLat,
          lng: originLong
        },
        destination: {
          lat: destinationLat,
          lng: destinationLong
        },
        service_id: "e6f9a0b7-8f03-431f-a3da-7fbc914bbb72"
      }
    );

    const deliveryFee = estimate.data.data.delivery_fee;
    this.setState({
      estimate: deliveryFee
    });
    return estimate.data;
  }

  async displayMap() {
    console.log("before");
    if (!this.state.origin || !this.state.destination) {
      alert("Enter Origin and Destination");
      return false;
    }
    const originLocation = await this.getLongLat(this.state.origin);
    const destinationLocation = await this.getLongLat(this.state.destination);

    const points = [
      { lat: originLocation.lat, lng: originLocation.lng },
      { lat: destinationLocation.lat, lng: destinationLocation.lng }
    ];

    const bounds = new this.props.google.maps.LatLngBounds();
    for (var i = 0; i < points.length; i++) {
      bounds.extend(points[i]);
    }

    this.setState(
      {
        bounds,
        originLong: originLocation.lng,
        destinationLong: destinationLocation.lng,
        originLat: originLocation.lat,
        destinationLat: destinationLocation.lat
      },
      () => this.getEstimate()
    );
  }

  render() {
    return (
      <div id="divStyle" className="bg-white pa3 ma2 bw2 ">
        <input
          id="inputStyle"
          className=" b--green bg-lightest-blue pa3 ma2 bw2 "
          type="text"
          name="origin"
          placeholder="Pickup location"
          value={this.state.origin}
          onChange={this.handleChange}
        />
        <input
          id="inputStyle1"
          className="b--green bg-lightest-blue pa3 ma2 bw2 "
          type="text"
          name="destination"
          placeholder="Destination"
          value={this.state.destination}
          onChange={this.handleChange}
        />
        <button
          className="f6 link dim ba ph3 pv2 mb2 dib dark-gray"
          type="button"
          onClick={() => this.displayMap()}
        >
          Calculate Estimate
        </button>
        <div id="divStyle1" className="bg-white pa3 ma2 bw2 ">
          The estimate price is {this.state.estimate}.
        </div>

        <Map
          google={this.props.google}
          zoom={14}
          initialCenter={{
            lat: "6.5244",
            lng: "3.3792"
          }}
          bounds={this.state.bounds}
        >
          <Marker onClick={this.onMarkerClick} name={"Current location"} />
          <InfoWindow onClose={this.onInfoWindowClose}>
            <h1>Map</h1>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: GMaps_API_KEY
})(App);
