interface AppProps {
  title: string;
}

export function App({ title }: AppProps) {
  return <h1>{title}</h1>;
}
