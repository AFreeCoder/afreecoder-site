/** 首页陈述：身份与「正在构建」已在边栏，这里只保留一句标语和一句导读，把首屏让给产品与文章 */
export function HomeHero() {
  return (
    <header className="hero">
      <h1 className="hero-title">
        <span>构建 AI 产品，</span>
        <span>
          用代码追求<em className="hero-k">自由</em>。
        </span>
      </h1>
      <p className="hero-sub">这里记录我正在构建的产品，和构建过程中的思考。</p>
    </header>
  );
}
