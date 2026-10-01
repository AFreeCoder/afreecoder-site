import Image from "next/image";
import type { Product } from "@/lib/types";
import { ProductPlaceholder } from "./product-placeholder";

type Props = {
  product: Product;
  /** 主打产品：名称旁加「主打」徽章 */
  featured?: boolean;
};

const THUMB_WIDTH = 320;

/** 首页缩略图只有 152px 宽，把 OSS 图片处理参数里的缩放宽度换小，避免下载 1080px 原图 */
function thumbnailOf(src: string): string {
  return src.replace(
    /(x-oss-process=image\/resize,w_)\d+/,
    (_match, prefix: string) => `${prefix}${THUMB_WIDTH}`,
  );
}

export function ProductRow({ product, featured = false }: Props) {
  const inner = (
    <>
      <div className="product-row-shot">
        {product.screenshot ? (
          <Image
            src={thumbnailOf(product.screenshot)}
            alt=""
            unoptimized
            fill
            sizes="152px"
            loading="eager"
            className="product-row-image"
          />
        ) : (
          <ProductPlaceholder name={product.name} />
        )}
      </div>
      <div className="product-row-body">
        <div className="product-row-name">
          {product.name}
          {featured && <span className="product-row-badge">主打</span>}
        </div>
        <p className="product-row-desc">{product.description}</p>
        <div className="product-row-meta">
          <span className="product-row-role">{product.role}</span>
          {product.link && (
            <span className="product-row-host">{new URL(product.link).hostname} ↗</span>
          )}
        </div>
      </div>
    </>
  );

  if (product.link) {
    return (
      <a
        href={product.link}
        target="_blank"
        rel="noreferrer"
        className="product-row"
        aria-label={`${product.name} — ${product.description}`}
      >
        {inner}
      </a>
    );
  }
  return <div className="product-row">{inner}</div>;
}
