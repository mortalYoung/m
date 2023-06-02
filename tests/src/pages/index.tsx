import { useEffect, useState } from "react";
import yayJpg from "../assets/yay.jpg";

export default function HomePage() {
	const [response, setResponse] = useState({});
	useEffect(() => {
		fetch("/api/v1/getInfo", {
			method: "POST",
			body: JSON.stringify({
				param1: true,
				param2: 1,
			}),
		})
			.then((res) => res.json())
			.then(setResponse);
	}, []);
	return (
		<div>
			<h2>Yay! Welcome to umi!</h2>
			<p>
				<img src={yayJpg} width="388" />
			</p>
			<p>
				To get started, edit <code>pages/index.tsx</code> and save to reload.
			</p>
			<pre>{JSON.stringify(response, null, 2)}</pre>
		</div>
	);
}
