"use client";

import { Link } from "@radix-ui/themes";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import type { ComponentProps } from "react";

type ExternalLinkProps = Omit<ComponentProps<typeof Link>, "target" | "rel"> & {
	href: string;
};

export function ExternalLink({ children, ...props }: ExternalLinkProps) {
	return (
		<Link {...props} target="_blank" rel="noopener noreferrer">
			{children}
			<ExternalLinkIcon style={{ display: "inline", marginLeft: 4, verticalAlign: "middle" }} />
		</Link>
	);
}
