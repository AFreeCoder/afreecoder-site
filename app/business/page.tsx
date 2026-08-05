import { SectionHead } from "@/components/site/section-head";

export const metadata = {
  title: "业务信息",
  description:
    "AFreeCoder 运营的 APIPool 与 ShipArt 在线数字服务、客户支持和交易政策说明。",
};

const businesses = [
  {
    name: "APIPool",
    domain: "app.apipool.dev",
    href: "https://app.apipool.dev",
    description:
      "面向开发者的 AI API 服务。用户可在平台中获取并管理对多种 AI 模型与相关开发者服务的访问。",
    supportEmail: "support@apipool.dev",
    termsHref: "https://app.apipool.dev/terms-of-service",
  },
  {
    name: "ShipArt",
    domain: "shipart.app",
    href: "https://shipart.app",
    description:
      "AI 图像创作服务。用户可通过平台使用生成式 AI 工具创建和管理数字图像作品。",
    supportEmail: "support@shipart.app",
    termsHref: "https://shipart.app/terms-of-service",
  },
] as const;

export default function BusinessPage() {
  return (
    <>
      <section className="section business-intro">
        <SectionHead title="业务信息" />
        <p>
          APIPool 与 ShipArt 品牌提供以下在线数字服务。本页提供每项服务的官方网站、客户支持和适用交易政策入口，供客户与支付服务提供商核验。
        </p>
      </section>

      <section className="section">
        <SectionHead title="在线服务" num="01" />
        <div className="business-grid">
          {businesses.map((business) => (
            <article className="business-card" key={business.name}>
              <p className="business-card-eyebrow">DIGITAL SERVICE</p>
              <h3>{business.name}</h3>
              <p>{business.description}</p>
              <dl className="business-card-details">
                <div>
                  <dt>官方网站</dt>
                  <dd>
                    <a href={business.href} target="_blank" rel="noreferrer">
                      {business.domain} <span aria-hidden="true">↗</span>
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>客户支持</dt>
                  <dd>
                    <a href={`mailto:${business.supportEmail}`}>
                      {business.supportEmail}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>服务条款与退款政策</dt>
                  <dd>
                    <a href={business.termsHref} target="_blank" rel="noreferrer">
                      查看适用条款 <span aria-hidden="true">↗</span>
                    </a>
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

    </>
  );
}
