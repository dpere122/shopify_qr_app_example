import {useNavigate, TitleBar,Loading}
from "@shopify/app-bridge-react";
import {
	AlphaCard,
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText
}from "@shopify/polaris"
export default function HomePage() {
	/*
	What is an app bridge Navigation hook?
	An app bridge navigation hook is a nav function
	that modifies the top-level browsers URL
	so that you can navigate within the embedded app
	and keep this browser in sync on reload
	*/
	const navigate = useNavigate();

	const isLoading = true;
	const isRefetching = false;
	const QRCodes = [];
	//lambda function assigning tags if loading
	const loadingMarkup = isLoading ? (
		<AlphaCard sectioned>
			<Loading />
			<SkeletonBodyText/>
		</AlphaCard>
	) : null;

	//Another lambda function to set emptystate 
	//if is not loading and if qr codes are empty
	//display a default empty state
	const emptyStateMarkup = 
		!isLoading && !QRCodes?.length ?(
			<AlphaCard Sectioned>
				<EmptyState
				heading="Create unique QR CODES for your product"
				action={{
					content: "Create QR CODE",
					onAction: () => navigate("/qrcodes/new")
				}}
				image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
				/>
				<p>
					Allow customers to scan codes and buy products
					using their phones.
				</p>
			</AlphaCard>
		) : null;
	return (
		<Page>
			<TitleBar
			title="QR CODES"
			primaryAction={{
				content: "Create QR CODE",
				onAction: () => navigate("/qrcodes/new")
			}}
			/>
			<Layout>
				<Layout.Section>
					{loadingMarkup}
					{emptyStateMarkup}
				</Layout.Section>
			</Layout>
		</Page>
	);
}
