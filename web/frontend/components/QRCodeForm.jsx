import {useState,useCallback} from "react";
import {
    Banner,
    AlphaCard,
    Form,
    FormLayout,
    TextField,
    Button,
    ChoiceList,
    Select,
    Thumbnail,
    Icon,
    VerticalStack,
    Text,
    Layout,
    EmptyState,
    TextStyle
} from "@shopify/polaris"
import{
    ContextualSaveBar,
    ResourcePicker,
    useNavigate
} from "@shopify/app-bridge-react";
import {ImageMajor,AlertMinor} from "@shopify/polaris-icons";

//used for auth?
import { useAuthenticatedFetch, useAppQuery } from "../hooks";
//custom hooks
import {useForm,useField,notEmptyString} from "@shopify/react-form";

const NO_DISCOUNT_OPTION = {label:"No discount", value: ""};

//discount codes
const DISCOUNT_CODES = {};

export function QRCodeForm({ QRCode: InitialQRCode}){
    const [QRCode,setQRCode] = useState(InitialQRCode);
    const[showResourcePicker, setShowResourcePicker] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(QRCode?.product);
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    const deletedProduct = QRCode?.product?.title === "Deleted Product";

    const onSubmit = (body) => console.log("submit",body);

    const {
        fields: {
            title,
            productId,
            variantId,
            handle,
            discountId,
            discountCode,
            destination
        },
        dirty,
        reset,
        submitting,
        submit,
        makeClean
    } = useForm({
        fields: {
            title: useField({
                value: QRCode?.title || "",
                validates: [notEmptyString("Please name your QR Code")],
            }),
            productId: useField({
                value: deletedProduct ? "Deleted Product" : QRCode?.product?.id || "",
                validates: [notEmptyString("Please select a product")]
            }),
            variantId: useField(QRCode?.variantId || ""),
            handle: useField(QRCode?.handle || ""),
            destination: useField(
                QRCode?.destination ? [QRCode.destination] : ["product"]
            ),
            discountId: useField(QRCode?.discountId || NO_DISCOUNT_OPTION.value),
            discountCode: useField(QRCode?.discountCode || ""),
        },
        onSubmit,
    });

    const QRCodeURL = QRCode ? new URL(`/qrcodes/${QRCode.id}/image`, location.toString()).toString() : null;

    const handleProductChange = useCallback(({
    selection }) => {
        setSelectedProduct({
            title: selection[0].title,
            images: selection[0].images,
            handle: selection[0].handle
        });
        productId.onChange(selection[0].id);
        variantId.onChange(selection[0].variants[0].id);
        handle.onChange(selection[0].handle);
        setShowResourcePicker(false);
    }, []);

    const handleDiscountChange = useCallback((id)=>
    {
        discountId.onChange(id);
        discountCode.onChange(DISCOUNT_CODES[id] || "");
    },[]);

    const toggleResourcePicker = useCallback(
        () =>
        setShowResourcePicker(!showResourcePicker),[showResourcePicker]
    );

    const isDeleting = false;
    const deleteQRCode = () => console.log("delete");

    const shopData = null;
    const isLoadingShopData = true;
    const discountOptions = [NO_DISCOUNT_OPTION];

    const goToDestination = useCallback(() =>{
        if(!selectedProduct) return;
        const data = {
            shopURL: shopData?.shop.url,
            productHandle: handle.value || selectedProduct.handle,
            discountCode: discountCode.value || undefined,
            variantId: variantId.value,
        };
        const targetURL = deletedProduct || destination.value[0] === "product"
        ? productViewURL(data) :productCheckoutURL(data);

        window.open(targetURL,"_blank", "norefferer,noopener");

    },[QRCode,selectedProduct,destination,discountCode,handle,variantId,shopData]);

    const imageSrc = selectedProduct?.images?.edges?.[0]?.node.url;
    const originalImageSrc = selectedProduct?.images?.[0]?.originalSrc;
    const altText = selectedProduct?.images?.[0]?.altText || selectedProduct?.title;

    return(
        <Stack VerticalStack>
            {deletedProduct && (
                <Banner
                    title="The product for this QR code no longer exists."
                    status="critical"
                >
                    <p>
                        Scans will be directed to a 404 page,
                        or you can choose another product for this QR Code.
                    </p>
                </Banner>
            )}
            <Layout>
                <Layout.Section>
                    <Form>
                        <ContextualSaveBar
                            saveAction={{
                                label: "Save",
                                onAction: submit,
                                loading: submitting,
                                disabled: submitting
                            }}
                            discardAction={{
                                label: "Discard",
                                onAction: reset,
                                loading: submitting,
                                disabled: submitting
                            }}
                            visible={dirty}
                            fullWidth
                        />
                        <FormLayout>
                            <AlphaCard sectioned title="Title">
                                <TextField
                                {...title}
                                label="Title"
                                labelHidden
                                helpText = "Only Store staff can see this title"
                            />
                            </AlphaCard>
                            <AlphaCard
                                title="Product"
                                actions={[
                                    {
                                        content: productId.value ? "Change Product" : "Select Product",
                                        onAction: toggleResourcePicker
                                    }
                                ]}
                            >
                                <AlphaCard.Section>
                                    {showResourcePicker &&(
                                        <ResourcePicker
                                        resourceType="Product"
                                        showVariants={false}
                                        selectMultiple={false}
                                        onCancel = {toggleResourcePicker}
                                        onSelection = {handleProductChange}
                                        open
                                        />
                                    )}
                                    {productId.value ? (
                                        <VerticalStack align="center">
                                            {imageSrc || originalImageSrc ? (
                                                <Thumbnail
                                                    source={imageSrc ||
                                                    originalImageSrc}
                                                    alt={altText}
                                                />
                                            ) : (
                                                <Thumbnail
                                                    source={ImageMajor}
                                                    color="base"
                                                    size="small"
                                                />
                                            )}
                                            <Text
                                                variant="strong">
                                                    {selectedProduct.title}
                                                </Text>
                                        </VerticalStack>
                                    ) : (
                                        <VerticalStack
                                            spacing="extraTight">
                                                <Button
                                                    onClick={toggleResourcePicker}>
                                                        select product
                                                </Button>
                                                {productId.error &&(
                                                    <VerticalStack spacing="tight">
                                                        <Icon source={AlertMinor} color="critical"/>
                                                        <Text variation="negative">
                                                            {productId.error}
                                                        </Text>
                                                    </VerticalStack>
                                                )}
                                        </VerticalStack>
                                    )}
                                </AlphaCard.Section>
                                <AlphaCard.Section title="Scan Destination">
									<ChoiceList
										title="Scan Destination"
										titleHidden
										choices={[
											{
												label:"Link to product page",
												value:"product"
											},
											{
												label: "Link to checkout page with product in the cart",
												value: "checkout",
											},
										]}
										selected={destination.value}
										onChange={destination.onChange}
									/>
                                </AlphaCard.Section>
                            </AlphaCard>
							<AlphaCard
								sectioned
								titled="Discount"
								actions={[
									{
										content: "Create discount",
										onAction: () =>
											navigate(
												{
													name: "Discount",
													resource: {
														create: true
													}
												},
												{
													target: "new"
												}
											)
									}
								]}
							/>
                        </FormLayout>
                    </Form>
                </Layout.Section>
				<Layout.Section secondary>
					<AlphaCard sectioned title="QR Code">
						{QRCode ? (
							<EmptyState imageContained={true}
							image={QRCodeURL}/>
						) : (
							<EmptyState>
								<p>
									Your QR code will appear here after you save.
								</p>
							</EmptyState>
						)}
						<VerticalStack>
							<Button
								fullWidth
								primary
								download
								url={QRCodeURL}
								disabled = {!QRCode || isDeleting}>
							Go to Destination
							</Button>
						</VerticalStack>
					</AlphaCard>
				</Layout.Section>
				<Layout.Section>
					{QRCode?.id &&(
						<Button
							outline
							destructive
							onClick={deleteQRCode}
							loading={isDeleting}
						>
							Delete QR Code
						</Button>
					)}
				</Layout.Section>
            </Layout>
        </Stack>
    );
}

function productViewURL({ shopUrl, productHandle, discountCode}){
	const url = new URL(shopUrl);
	const productPath = `/products/${productHandle}`;

	if(discountCode){
		url.pathname = `/discount/${discountCode}`;
		url.searchParams.append("redirect",productPath);
	}else{
		url.pathname = productPath;
	}
	return url.toString();
}

function productCheckoutURL({ shopUrl,variantId,quantity = 1,discountCode}){
	const url = new URL(shopUrl);
	const id = variantId.replace(
		/gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
		"$1"
	);

	url.pathname = `/cart/${id}:${quantity}`;

	if(discountCode){
		url.searchParams.append("discount", discountCode);
	}

	return url.toString();
}