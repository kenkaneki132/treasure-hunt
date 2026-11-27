import React from "react";
import { Link } from "react-router-dom";
import { Chest, Jolly } from "./Icons";
import { MapArt, Compass } from "./MapArt";
import PortfolioBadge from "./PortfolioBadge";
import "./startPage.css";

function StartPage() {
  return (
    <main className="startpage">
      <div className="sea" aria-hidden="true"><i /><i /><i /></div>
      <section className="start-map">
        <MapArt />
        <Compass />
        <div className="start-content">
          <span className="start-flag"><Jolly size={44} /></span>
          <h1 className="startpage-title">Treasure Hunt</h1>
          <p className="start-tagline">5 hidden treasures. 48 numbers. 15 seconds to place your bets.</p>
          <div className="start-chest" aria-hidden="true"><Chest open size={92} /><span className="glint" /></div>
          <ol className="start-steps">
            <li><b>Pick</b> up to 6 numbers and a chip</li>
            <li><b>Beat</b> the 15-second timer</li>
            <li><b>Win</b> bet × (hits + 1)</li>
          </ol>
          <Link to="/Game" className="startpagelink">Play game</Link>
        </div>
      </section>
      <div className="start-badge"><PortfolioBadge /></div>
    </main>
  );
}

export default StartPage;
