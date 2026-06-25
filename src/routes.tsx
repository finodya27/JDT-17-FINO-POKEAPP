import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import Homepage from "./container/Homepage";
import PokemonDetail from "./container/PokemonDetail";
import MyPokemon from "./container/MyPokemon";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Homepage />
      },
      {
        path: "pokemon/:name",
        element: <PokemonDetail />
      },
      {
        path: "my-pokemon",
        element: <MyPokemon />
      }
    ]
  }
]);
