import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Radio, Button } from '@faithlife/styled-ui';
import { useLocalization } from '../../Localization';
import OrdersClient from '../../clients/orders-client';
import LocationsClient from '../../clients/locations-client';
import IBillingProfileDto from '../../clients/typings/orders/IBillingProfileDto';
import ICountryDto from '../../clients/typings/locations/ICountryDto';
import IStateDto from '../../clients/typings/locations/IStateDto';
import BillingProfile from './billing-profile';
import BillingProfileMapper from '../../mappers/BillingProfileMapper';
import EditBillingProfile from './edit-billing-profile';
import * as Styled from './styled';
import IEditBillingProfile from '../../typings/IEditBillingProfile';
import { isErrors } from '../../clients/typings/orders/IErrors';
import IError from '../../clients/typings/orders/IError';
import IBillingProfileInfo from '../../typings/IBillingProfileInfo';
import { ISystemMessage } from '../../typings/ISystemMessage';
import IUsageInfoDto from '../../clients/typings/orders/UsageInfoDto';

type billingProfileChangeKind = 'selected' | 'deleted';

interface IBillingProfilesProps {
	onSelectedBillingProfileChange: (
		billingProfile: IBillingProfileInfo,
		action: billingProfileChangeKind
	) => void;
	actAndHandleException: <T>(
		action: () => Promise<T>,
		actionDescription: string
	) => Promise<T | undefined>;
	setSystemMessage: (systemMessage: ISystemMessage) => void;
}

const BillingProfiles: React.FunctionComponent<IBillingProfilesProps> = ({
	onSelectedBillingProfileChange,
	actAndHandleException,
	setSystemMessage,
}) => {
	const [billingProfiles, setBillingProfiles] = useState<IBillingProfileDto[]>([]);
	const [usageInfo, setUsageInfo] = useState<IUsageInfoDto>();
	const [billingProfileValidationErrors, setBillingProfileValidationErrors] = useState<IError[]>(
		[]
	);
	const [showAllPaymentMethods, setShowAllPaymentMethods] = useState<boolean>(false);
	const [shouldRefreshBillingProfiles, setShouldRefreshBillingProfiles] = useState(true);
	const [selectedBillingProfileId, setSelectedBillingProfileId] = useState<string | null>(null);
	const [isAddingNewBillingProfile, setIsAddingNewBillingProfile] = useState(false);
	const [editingBillingProfileId, setEditingBillingProfileId] = useState<string | null>(null);
	const [countries, setCountries] = useState<ICountryDto[]>([]);
	const [statesByCountryId, setStatesByCountryId] = useState<Record<string, IStateDto[]>>({});

	const strings = useLocalization();

	useEffect(() => {
		const loadBillingProfiles = async () => {
			const billingProfiles = await OrdersClient.getBillingProfiles();
			setBillingProfiles(billingProfiles.billingProfiles);
			setUsageInfo(billingProfiles.usageInfo);
		};

		actAndHandleException(loadBillingProfiles, strings.fetchBillingProfiles);
	}, [setBillingProfiles, actAndHandleException, strings.fetchBillingProfiles]);

	// load list of countries for editing billing profiles
	useEffect(() => {
		const loadCountries = async () => {
			const countries = await LocationsClient.getCountries();
			setCountries(countries);
		};

		actAndHandleException(loadCountries, strings.fetchCountries);
	}, [setCountries, actAndHandleException, strings.fetchCountries]);

	const fetchStatesForCountry = useCallback(
		async (countryId: string) => {
			if (!Object.prototype.hasOwnProperty.call(statesByCountryId, countryId)) {
				const getStates = async () => {
					const states = await LocationsClient.getStatesForCountry(countryId);

					setStatesByCountryId(prev => ({
						...prev,
						[countryId]: states,
					}));
				};
				await actAndHandleException(getStates, strings.fetchStates);
			}
		},
		[statesByCountryId, actAndHandleException, strings.fetchStates]
	);

	// load list of states for editing billing profiles
	useEffect(() => {
		const loadCountries = async () => {
			const unitedStatesCountryId = '840';
			await fetchStatesForCountry(unitedStatesCountryId);
		};

		actAndHandleException(loadCountries, strings.fetchCountries);
	}, [fetchStatesForCountry, actAndHandleException, strings.fetchCountries]);

	// refresh billing profiles if necessary
	useEffect(() => {
		if (shouldRefreshBillingProfiles) {
			setShouldRefreshBillingProfiles(false);

			const getBillingProfiles = async () => {
				const freshProfiles = await OrdersClient.getBillingProfiles();

				setBillingProfiles(freshProfiles.billingProfiles);
				if (freshProfiles.billingProfiles.length > 0) {
					const defaultProfile = freshProfiles.billingProfiles.filter(p => p.isDefault)[0];
					if (defaultProfile) {
						setSelectedBillingProfileId(defaultProfile.profileId);
					}
				}
			};

			actAndHandleException(getBillingProfiles, strings.fetchBillingProfiles);
		}
	}, [shouldRefreshBillingProfiles, actAndHandleException, strings.fetchBillingProfiles]);

	const onSelectBillingProfile = useCallback(
		(billingProfile: IBillingProfileDto) => {
			const country =
				countries && countries.find(c => c.countryId === billingProfile.countryId.toString());
			onSelectedBillingProfileChange(
				{
					billingProfileDto: billingProfile,
					countryAlpha2: (country && country.alpha2) || 'US',
				},
				'selected'
			);

			setSelectedBillingProfileId(billingProfile.profileId);
		},
		[countries, onSelectedBillingProfileChange]
	);

	// TODO: add bank accounts too
	const createOrdersApiBillingProfile = useCallback(
		async (newBillingProfile: IEditBillingProfile) => {
			const createProfile = async () => {
				const newOrdersBillingProfile = BillingProfileMapper.mapForCreatingInOrdersApi(
					newBillingProfile
				);
				const response = await OrdersClient.createOrdersBillingProfile(newOrdersBillingProfile);

				if (isErrors(response)) {
					const fieldErrors = response.errors.filter(e => e.property !== null);
					const hasGeneralErrors = response.errors.some(e => e.message !== null);

					setBillingProfileValidationErrors(fieldErrors);
					if (hasGeneralErrors) {
						setSystemMessage({
							message: strings.billingUpdateError,
							status: 'error',
						});
					}
				} else {
					setShouldRefreshBillingProfiles(true);
					setIsAddingNewBillingProfile(false);
					onSelectBillingProfile(response);
					setSelectedBillingProfileId(response.profileId);
				}
			};

			await actAndHandleException(createProfile, strings.createProfile);
		},
		[onSelectBillingProfile, actAndHandleException, setSystemMessage, strings]
	);

	const updateBillingProfile = useCallback(
		async (profileId: string, profile: IEditBillingProfile) => {
			const updateProfile = async () => {
				const response = await OrdersClient.updateOrdersBillingProfile(
					profileId,
					BillingProfileMapper.mapForUpdating(profile)
				);

				if (isErrors(response)) {
					setBillingProfileValidationErrors(response.errors.filter(e => e.property !== null));
					if (response.errors.some(e => e.message !== null)) {
						setSystemMessage({
							message: strings.billingUpdateError,
							status: 'error',
						});
					}
				} else {
					setEditingBillingProfileId(null);
					setShouldRefreshBillingProfiles(true);
					setSelectedBillingProfileId(profileId);
				}
			};
			await actAndHandleException(updateProfile, strings.updateProfile);
		},
		[setSystemMessage, strings, actAndHandleException]
	);

	const onDeleteBillingProfile = useCallback(
		async (billingProfileId: string): Promise<boolean> => {
			const deleteProfile = async () => {
				await OrdersClient.deleteOrdersBillingProfile(billingProfileId);

				setShouldRefreshBillingProfiles(true);
				return true;
			};

			return (await actAndHandleException(deleteProfile, strings.deleteProfile)) || false;
		},
		[strings, actAndHandleException]
	);

	const toggleEditBillingProfile = useCallback(
		(billingProfileId: string): void => {
			editingBillingProfileId
				? setEditingBillingProfileId(null)
				: setEditingBillingProfileId(billingProfileId);
		},
		[editingBillingProfileId, setEditingBillingProfileId]
	);

	const displayProfiles = showAllPaymentMethods ? billingProfiles : billingProfiles.slice(0, 3);
	return (
		<Styled.BillingProfilesContainer>
			<Styled.BillingProfilesSection>
				<Styled.BillingProfiles data-test-id="billing-profiles">
					<Styled.CreditCardRow>
						<Radio
							onClick={() => setIsAddingNewBillingProfile(true)}
							isChecked={isAddingNewBillingProfile}
							type="button"
						>
							<Styled.NewCardLabel data-test-id="add-payment-method-button">
								{strings.newCreditCard}
							</Styled.NewCardLabel>
						</Radio>
					</Styled.CreditCardRow>
					{isAddingNewBillingProfile && (
						<EditBillingProfile
							onCommitBillingProfile={createOrdersApiBillingProfile}
							onCancelEditingBillingProfile={() => setIsAddingNewBillingProfile(false)}
							serverValidationErrors={billingProfileValidationErrors}
							countries={countries}
							statesByCountryId={statesByCountryId}
							onSelectedCountryChanged={fetchStatesForCountry}
							usageInfo={usageInfo}
						/>
					)}
					{displayProfiles
						? displayProfiles.map((p, i) => (
								<Fragment key={i}>
									<BillingProfile
										billingProfile={p}
										onDelete={onDeleteBillingProfile}
										onUpdate={() => toggleEditBillingProfile(p.profileId)}
										isSelected={selectedBillingProfileId === p.profileId}
										onSelected={() => onSelectBillingProfile(p)}
										index={i}
										isEditing={editingBillingProfileId === p.profileId}
									/>
									{editingBillingProfileId === p.profileId && (
										<EditBillingProfile
											billingProfile={BillingProfileMapper.mapForEditing(
												displayProfiles.find(
													p => p.profileId === editingBillingProfileId
												) as IBillingProfileDto
											)}
											onCommitBillingProfile={profile =>
												updateBillingProfile(editingBillingProfileId, profile)
											}
											onCancelEditingBillingProfile={() => setEditingBillingProfileId(null)}
											serverValidationErrors={billingProfileValidationErrors}
											countries={countries}
											statesByCountryId={statesByCountryId}
											onSelectedCountryChanged={fetchStatesForCountry}
											usageInfo={usageInfo}
										/>
									)}
								</Fragment>
						  ))
						: null}
					{billingProfiles && billingProfiles.length > 3 && !showAllPaymentMethods && (
						<Styled.CreditCardRow>
							<Button
								variant="primaryTransparent"
								width="100%"
								onClick={() => setShowAllPaymentMethods(true)}
							>
								{strings.showAllPaymentMethods}
							</Button>
						</Styled.CreditCardRow>
					)}
				</Styled.BillingProfiles>
			</Styled.BillingProfilesSection>
		</Styled.BillingProfilesContainer>
	);
};

export default BillingProfiles;
