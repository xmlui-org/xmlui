import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./DocsImage.module.scss";

type ImageProps = {
  alt: string;
  src: string;
  height?: number;
  width?: number;
};

export const DocsImage = ({ src, alt, width, height }: ImageProps) => (
  <Link href={src} target="_blank" className={styles.link}>
    <Image src={src} alt={alt} width={0} height={0} style={{ width: width || "100%", height: height || "auto" }} />
  </Link>
);
