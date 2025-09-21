import React, { useState } from "react";
import { BLOCKFROST_API_KEY } from "../config";

const BLOCKFROST_API_URL = "https://cardano-preview.blockfrost.io/api/v0";

export default function AddressLookup() {
  const [address, setAddress] = useState("");
  const [data, setData] = useState(null);
  const [txs, setTxs] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setData(null);
    setTxs([]);
    try {
      // Fetch address info
      const res = await fetch(
        `${BLOCKFROST_API_URL}/addresses/${address}`,
        {
          headers: { project_id: BLOCKFROST_API_KEY },
        }
      );
      if (!res.ok) throw new Error("Address not found or invalid.");
      const json = await res.json();
      setData(json);

      // Fetch transactions for the address
      const txRes = await fetch(
        `${BLOCKFROST_API_URL}/addresses/${address}/transactions?order=desc&count=10`,
        {
          headers: { project_id: BLOCKFROST_API_KEY },
        }
      );
      if (!txRes.ok) throw new Error("Could not fetch transactions.");
      const txJson = await txRes.json();
      setTxs(txJson);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Cardano Preview address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ width: "400px" }}
        />
        <button type="submit">Lookup</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {data && (
        <div>
          <pre style={{ textAlign: "left", background: "#eee", padding: "1em" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
          <div>
            <strong>Recent Transactions:</strong>
            {txs.length === 0 ? (
              <div>No transactions found for this address on Preview network.</div>
            ) : (
              <ul>
                {txs.map((tx) => (
                  <li key={tx.tx_hash}>
                    <a
                      href={`https://preview.cardanoscan.io/transaction/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tx.tx_hash}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
