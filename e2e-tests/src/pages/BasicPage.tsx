import Banner from "../components/Banner";
import Container from "../components/Container";

export default function BasicPage() {
  return (
    <div>
      <Container>
        <Banner bool={false} num={0} />
      </Container>
    </div>
  );
}
