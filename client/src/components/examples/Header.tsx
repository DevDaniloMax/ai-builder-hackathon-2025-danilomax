import Header from '../Header';

export default function HeaderExample() {
  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  return <Header onMenuClick={handleMenuClick} />;
}
