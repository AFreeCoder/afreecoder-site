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
  },
  {
    name: "ShipArt",
    domain: "shipart.app",
    href: "https://shipart.app",
    description:
      "AI 图像创作服务。用户可通过平台使用生成式 AI 工具创建和管理数字图像作品。",
  },
] as const;

export default function BusinessPage() {
  return (
    <>
      <section className="section business-intro">
        <SectionHead title="业务信息" />
        <p>
          APIPool 与 ShipArt 品牌提供以下在线数字服务。本页提供服务范围、客户支持和交易政策说明，供客户与支付服务提供商核验。
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
              <a href={business.href} target="_blank" rel="noreferrer">
                访问 {business.domain} <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead title="客户支持与交易政策" num="02" tone="accent-2" />
        <dl className="business-policy-list">
          <div>
            <dt>客户支持</dt>
            <dd>
              如需订单、账单或服务支持，请发送邮件至{" "}
              <a href="mailto:hello@afreecoder.dev">hello@afreecoder.dev</a>。
            </dd>
          </div>
          <div>
            <dt>服务交付</dt>
            <dd>
              两项服务均为在线数字服务。付款成功后，相关的账户访问、订阅权益或已购买的服务额度将在对应产品平台中提供。
            </dd>
          </div>
          <div>
            <dt>退款与争议</dt>
            <dd>
              如对付款或服务有疑问，请先通过上述邮箱联系并提供订单信息。我们会核验订单与服务使用情况，并依适用法律及对应产品的交易条款处理退款或争议请求；已经交付或使用的数字服务可能不符合退款条件。
            </dd>
          </div>
          <div>
            <dt>订阅取消</dt>
            <dd>
              如选择自动续费的订阅方案，用户可在对应产品的账户与账单设置中，于下一个计费周期开始前取消续费。取消后，服务通常持续至当前已付费周期结束；具体可用性以产品页面显示为准。
            </dd>
          </div>
          <div>
            <dt>配送与促销</dt>
            <dd>
              不销售或配送实物商品，因此不适用退货或物流政策。任何限时优惠均以活动页面明确展示的资格、价格、有效期和条款为准。
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
